const { Game, User } = require("../models");
const playerGameRepo = require("../repositories/playerGameRepository");
const gameStateRepo = require("../repositories/gameStateRepository");
const playerHandRepo = require("../repositories/playerHandRepository");
const playerRepo = require("../repositories/playerRepository");
const scoreRepo = require("../repositories/scoreRepository");
const lobbyEvents = require("../realtime/gameLobbyEvents");
const { buildDeck, shuffle, canPlay } = require("../utils/unoDeck");

function nextIndex(current, total, direction) {
  return (current + direction + total) % total;
}

function normalizeColor(color) {
  if (!color) return null;
  const c = String(color).trim().toLowerCase();
  if (["red", "yellow", "green", "blue"].includes(c)) return c;
  return null;
}

function buildHistoryEntry(type, payload = {}) {
  return {
    type,
    createdAt: new Date().toISOString(),
    ...payload
  };
}

async function appendHistory(state, entry) {
  const history = Array.isArray(state.moveHistory) ? [...state.moveHistory] : [];
  history.push(entry);
  await state.update({ moveHistory: history });
}

async function buildRealtimeSnapshot(gameId) {
  const game = await Game.findByPk(gameId);
  if (!game) return null;

  const players = await playerGameRepo.findByGame(gameId);
  const hands = await playerHandRepo.findByGameId(gameId);
  const state = await gameStateRepo.findByGameId(gameId);

  const handMap = new Map(hands.map((h) => [h.userId, h]));

  return {
    gameId: game.id,
    title: game.title,
    status: game.status,
    currentPlayerIndex: state ? state.currentPlayerIndex : 0,
    direction: state ? state.direction : 1,
    topCard:
      state && state.discardPile && state.discardPile.length
        ? state.discardPile[state.discardPile.length - 1]
        : null,
    history: state?.moveHistory || [],
    players: players.map((p, index) => {
      const hand = handMap.get(p.userId);
      return {
        userId: p.userId,
        username: p.user ? p.user.username : null,
        isReady: p.isReady,
        handCount: hand?.cards?.length || 0,
        isCurrentTurn: state ? index === state.currentPlayerIndex : false,
        mustDeclareUno: hand ? hand.mustDeclareUno : false,
        unoDeclared: hand ? hand.unoDeclared : false
      };
    }),
    winnerUserId: state ? state.winnerUserId : null
  };
}

async function buildPlayerView(gameId, userId) {
  const snapshot = await buildRealtimeSnapshot(gameId);
  const hand = await playerHandRepo.findByGameAndUser(gameId, userId);

  return {
    ...snapshot,
    myHand: hand ? hand.cards : [],
    mustDeclareUno: hand ? hand.mustDeclareUno : false,
    unoDeclared: hand ? hand.unoDeclared : false
  };
}

async function startRealtimeGame(gameId) {
  const game = await Game.findByPk(gameId);
  if (!game) return null;

  const players = await playerGameRepo.findByGame(gameId);
  if (players.length < 2) {
    return { error: "Not enough players" };
  }

  const deck = shuffle(buildDeck());
  const playerHands = [];

  for (const player of players) {
    const cards = deck.splice(0, 7);
    playerHands.push({ userId: player.userId, cards });
  }

  let topCard = deck.shift();
  while (topCard.color === "wild") {
    deck.push(topCard);
    topCard = deck.shift();
  }

  const state = await gameStateRepo.create({
    gameId,
    deck,
    discardPile: [topCard],
    direction: 1,
    currentPlayerIndex: 0,
    started: true,
    winnerUserId: null,
    moveHistory: [
      buildHistoryEntry("game_started", {
        gameId,
        message: "The game started."
      }),
      buildHistoryEntry("initial_card", {
        gameId,
        card: topCard,
        message: `Initial discard card: ${topCard.color} ${topCard.value}`
      })
    ]
  });

  for (const player of playerHands) {
    await playerHandRepo.create({
      gameId,
      userId: player.userId,
      cards: player.cards,
      mustDeclareUno: false,
      unoDeclared: false
    });
  }

  return { ok: true, state };
}

async function ensureWinnerPlayerAndScore(winnerUserId, gameId) {
  const winnerUser = await User.findByPk(winnerUserId);
  if (!winnerUser) return;

  let player = null;

  if (winnerUser.email) {
    player = await playerRepo.findByEmail(winnerUser.email);
  }

  if (!player) {
    player = await playerRepo.create({
      name: winnerUser.username || `User ${winnerUser.id}`,
      age: 18,
      email: winnerUser.email || `user${winnerUser.id}@uno.local`
    });
  }

  const existingScore = await scoreRepo.findByPlayerAndGame(player.id, gameId);
  if (existingScore) return;

  await scoreRepo.create({
    playerId: player.id,
    gameId,
    score: 1
  });
}

async function playCard(gameId, userId, cardIndex, chosenColor) {
  const state = await gameStateRepo.findByGameId(gameId);
  if (!state) return { error: "Game state not found", status: 404 };

  const players = await playerGameRepo.findByGame(gameId);
  const currentPlayer = players[state.currentPlayerIndex];
  if (!currentPlayer || currentPlayer.userId !== userId) {
    return { error: "It is not your turn", status: 409 };
  }

  const hand = await playerHandRepo.findByGameAndUser(gameId, userId);
  if (!hand) return { error: "Hand not found", status: 404 };

  const cards = [...hand.cards];
  const chosenCard = cards[cardIndex];

  if (!chosenCard) {
    return { error: "Invalid card index", status: 400 };
  }

  const topCard = state.discardPile[state.discardPile.length - 1];
  if (!canPlay(chosenCard, topCard)) {
    return { error: "Invalid move", status: 409 };
  }

  let cardToDiscard = { ...chosenCard };
  const wildColor = normalizeColor(chosenColor);

  if ((chosenCard.value === "wild" || chosenCard.value === "wild_draw4") && !wildColor) {
    return { error: "chosen_color is required for wild cards", status: 400 };
  }

  if (chosenCard.value === "wild" || chosenCard.value === "wild_draw4") {
    cardToDiscard = {
      ...chosenCard,
      chosenColor: wildColor,
      color: wildColor
    };
  }

  cards.splice(cardIndex, 1);

  let direction = state.direction;
  let step = 1;
  let newDeck = [...state.deck];

  if (chosenCard.value === "reverse") {
    direction = direction * -1;
  } else if (chosenCard.value === "skip") {
    step = 2;
  } else if (chosenCard.value === "draw2") {
    const targetIndex = nextIndex(state.currentPlayerIndex, players.length, direction);
    const targetPlayer = players[targetIndex];
    const targetHand = await playerHandRepo.findByGameAndUser(gameId, targetPlayer.userId);
    const drawn = newDeck.slice(0, 2);
    newDeck = newDeck.slice(2);

    await playerHandRepo.updateCards(targetHand.id, [...targetHand.cards, ...drawn]);
    await playerHandRepo.updateUnoState(targetHand.id, {
      mustDeclareUno: false,
      unoDeclared: false
    });

    step = 2;
  } else if (chosenCard.value === "wild_draw4") {
    const targetIndex = nextIndex(state.currentPlayerIndex, players.length, direction);
    const targetPlayer = players[targetIndex];
    const targetHand = await playerHandRepo.findByGameAndUser(gameId, targetPlayer.userId);
    const drawn = newDeck.slice(0, 4);
    newDeck = newDeck.slice(4);

    await playerHandRepo.updateCards(targetHand.id, [...targetHand.cards, ...drawn]);
    await playerHandRepo.updateUnoState(targetHand.id, {
      mustDeclareUno: false,
      unoDeclared: false
    });

    step = 2;
  }

  const newDiscard = [...state.discardPile, cardToDiscard];
  const winnerUserId = cards.length === 0 ? userId : null;

  await playerHandRepo.updateCards(hand.id, cards);
  await playerHandRepo.updateUnoState(hand.id, {
    mustDeclareUno: cards.length === 1,
    unoDeclared: false
  });

  let newCurrent = state.currentPlayerIndex;
  if (!winnerUserId) {
    for (let i = 0; i < step; i++) {
      newCurrent = nextIndex(newCurrent, players.length, direction);
    }
  }

  const game = await Game.findByPk(gameId);
  if (winnerUserId) {
    await game.update({ status: "finished" });
    await ensureWinnerPlayerAndScore(winnerUserId, gameId);
  }

  await state.update({
    discardPile: newDiscard,
    currentPlayerIndex: newCurrent,
    direction,
    deck: newDeck,
    winnerUserId
  });

  await appendHistory(state, buildHistoryEntry("card_played", {
    gameId,
    actor: userId,
    card: cardToDiscard,
    remainingCards: cards.length,
    message: winnerUserId
      ? "A player played the final card and won the game."
      : "A player played a card."
  }));

  lobbyEvents.emit("realtime_game_updated", {
    gameId,
    actor: userId,
    type: winnerUserId ? "game_finished" : "card_played",
    message: winnerUserId ? "A player won the game." : "A card was played."
  });

  return { ok: true };
}

async function drawCard(gameId, userId) {
  const state = await gameStateRepo.findByGameId(gameId);
  if (!state) return { error: "Game state not found", status: 404 };

  const players = await playerGameRepo.findByGame(gameId);
  const currentPlayer = players[state.currentPlayerIndex];
  if (!currentPlayer || currentPlayer.userId !== userId) {
    return { error: "It is not your turn", status: 409 };
  }

  if (!state.deck.length) {
    return { error: "Deck is empty", status: 409 };
  }

  const hand = await playerHandRepo.findByGameAndUser(gameId, userId);
  if (!hand) return { error: "Hand not found", status: 404 };

  const topCard = state.discardPile[state.discardPile.length - 1];
  const hasPlayableCard = hand.cards.some((card) => canPlay(card, topCard));

  if (hasPlayableCard) {
    return {
      error: "You already have a playable card in your hand and must play it",
      status: 409
    };
  }

  const card = state.deck[0];
  const newDeck = state.deck.slice(1);

  await playerHandRepo.updateCards(hand.id, [...hand.cards, card]);
  await playerHandRepo.updateUnoState(hand.id, {
    mustDeclareUno: false,
    unoDeclared: false
  });

  const nextTurn = nextIndex(state.currentPlayerIndex, players.length, state.direction);

  await state.update({
    deck: newDeck,
    currentPlayerIndex: nextTurn
  });

  await appendHistory(state, buildHistoryEntry("card_drawn", {
    gameId,
    actor: userId,
    card,
    message: "A player drew a card."
  }));

  lobbyEvents.emit("realtime_game_updated", {
    gameId,
    actor: userId,
    type: "card_drawn",
    message: "A player drew a card."
  });

  return { ok: true };
}

async function declareUno(gameId, userId) {
  const state = await gameStateRepo.findByGameId(gameId);
  if (!state) return { error: "Game state not found", status: 404 };

  const hand = await playerHandRepo.findByGameAndUser(gameId, userId);
  if (!hand) return { error: "Hand not found", status: 404 };

  if (hand.cards.length !== 1) {
    return { error: "UNO can only be declared with exactly 1 card", status: 409 };
  }

  await playerHandRepo.updateUnoState(hand.id, {
    mustDeclareUno: false,
    unoDeclared: true
  });

  await appendHistory(state, buildHistoryEntry("uno_declared", {
    gameId,
    actor: userId,
    message: "A player declared UNO."
  }));

  lobbyEvents.emit("realtime_game_updated", {
    gameId,
    actor: userId,
    type: "uno_declared",
    message: "A player declared UNO."
  });

  return { ok: true };
}

async function challengeUno(gameId, challengerUserId, targetUserId) {
  const state = await gameStateRepo.findByGameId(gameId);
  if (!state) return { error: "Game state not found", status: 404 };

  const challengerHand = await playerHandRepo.findByGameAndUser(gameId, challengerUserId);
  if (!challengerHand) return { error: "Challenger is not part of this game", status: 404 };

  const targetHand = await playerHandRepo.findByGameAndUser(gameId, targetUserId);
  if (!targetHand) return { error: "Target player is not part of this game", status: 404 };

  if (targetHand.cards.length !== 1) {
    return { error: "Target player does not have exactly 1 card", status: 409 };
  }

  if (targetHand.unoDeclared) {
    return { error: "Target player already declared UNO", status: 409 };
  }

  if (!targetHand.mustDeclareUno) {
    return { error: "Target player is not pending UNO declaration", status: 409 };
  }

  if (state.deck.length < 2) {
    return { error: "Deck does not have enough cards for UNO penalty", status: 409 };
  }

  const penaltyCards = state.deck.slice(0, 2);
  const newDeck = state.deck.slice(2);

  await playerHandRepo.updateCards(targetHand.id, [...targetHand.cards, ...penaltyCards]);
  await playerHandRepo.updateUnoState(targetHand.id, {
    mustDeclareUno: false,
    unoDeclared: false
  });

  await state.update({ deck: newDeck });

  await appendHistory(state, buildHistoryEntry("uno_challenged", {
    gameId,
    actor: challengerUserId,
    targetUserId,
    penaltyCards,
    message: "A player was challenged for not declaring UNO."
  }));

  lobbyEvents.emit("realtime_game_updated", {
    gameId,
    actor: challengerUserId,
    type: "uno_challenged",
    message: "A player was penalized for not declaring UNO."
  });

  return { ok: true };
}

async function getMoveHistory(gameId, userId) {
  const state = await gameStateRepo.findByGameId(gameId);
  if (!state) return { error: "Game state not found", status: 404 };

  const entry = await playerGameRepo.findByGameAndUser(gameId, userId);
  if (!entry) return { error: "User is not part of this game", status: 404 };

  return {
    ok: true,
    data: {
      gameId,
      history: state.moveHistory || []
    }
  };
}

module.exports = {
  startRealtimeGame,
  buildRealtimeSnapshot,
  buildPlayerView,
  playCard,
  drawCard,
  declareUno,
  challengeUno,
  getMoveHistory
};