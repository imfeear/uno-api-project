function buildDeck() {
  const colors = ["red", "yellow", "green", "blue"];
  const deck = [];

  for (const color of colors) {
    deck.push({ color, value: "0" });

    for (let i = 1; i <= 9; i++) {
      deck.push({ color, value: String(i) });
      deck.push({ color, value: String(i) });
    }

    ["skip", "reverse", "draw2"].forEach((value) => {
      deck.push({ color, value });
      deck.push({ color, value });
    });
  }

  for (let i = 0; i < 4; i++) {
    deck.push({ color: "wild", value: "wild" });
    deck.push({ color: "wild", value: "wild_draw4" });
  }

  return deck;
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function canPlay(card, topCard) {
  if (!topCard) return true;

  const activeColor = topCard.chosenColor || topCard.color;

  if (card.color === "wild") return true;
  if (card.color === activeColor) return true;
  if (card.value === topCard.value) return true;

  return false;
}

module.exports = {
  buildDeck,
  shuffle,
  canPlay,
};