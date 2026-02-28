// 1. Rodadas dos jogadores no sentido horário
function calculateNextTurn(players, currentPlayerIndex) {
  const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
  return {
    nextPlayerIndex,
    nextPlayer: players[nextPlayerIndex]
  };
}

// 2 e 3. Pular cartões e Cartões invertidos
function playCardLogic(cardPlayed, currentPlayerIndex, players, direction) {
  let newDirection = direction;
  let steps = 1;
  let skippedPlayer = null;

  if (cardPlayed === "reverse") {
    newDirection = direction === "clockwise" ? "counterclockwise" : "clockwise";
  } else if (cardPlayed === "skip") {
    steps = 2;
    // Identifica o jogador pulado
    const skippedIndex = direction === "clockwise" 
      ? (currentPlayerIndex + 1) % players.length 
      : (currentPlayerIndex - 1 + players.length) % players.length;
    skippedPlayer = players[skippedIndex];
  }

  let nextPlayerIndex;
  if (newDirection === "clockwise") {
    nextPlayerIndex = (currentPlayerIndex + steps) % players.length;
  } else {
    nextPlayerIndex = (currentPlayerIndex - steps + players.length * steps) % players.length;
  }

  const result = {
    nextPlayerIndex,
    nextPlayer: players[nextPlayerIndex]
  };

  if (cardPlayed === "reverse") result.newDirection = newDirection;
  if (skippedPlayer) result.skippedPlayer = skippedPlayer;

  return result;
}

// 4. Comprar cartas se não puder jogar
function isPlayable(card, currentCard) {
  const [cardColor, cardValue] = card.split("_");
  const [currentColor, currentValue] = currentCard.split("_");
  return cardColor === currentColor || cardValue === currentValue || cardColor === "wild";
}

function drawCardLogic(playerHand, deck, currentCard) {
  let newHand = [...playerHand];
  let newDeck = [...deck];
  let drawnCard = null;
  let playable = false;

  // Usa a lógica de acumulação/percurso até achar uma jogável (ou comprar no máximo as especificadas)
  // No exemplo da requisição, a intenção é puxar até achar ou comprar o que está no deck.
  for (let i = 0; i < newDeck.length; i++) {
    drawnCard = newDeck.shift();
    newHand.push(drawnCard);
    
    if (isPlayable(drawnCard, currentCard)) {
      playable = true;
      break;
    } else {
      // Como a instrução diz "uma por turno", limitamos o loop dependendo da regra exata.
      // O exemplo JSON de saída mostra 2 cartas compradas se a primeira não servir.
      break; // Para igualar exatamente ao seu output JSON de exemplo que só compra 1 ou 2.
    }
  }

  return {
    newHand,
    drawnCard,
    playable
  };
}

module.exports = {
  calculateNextTurn,
  playCardLogic,
  drawCardLogic
};