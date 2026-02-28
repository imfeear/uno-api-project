
const { calculateNextTurn, playCardLogic, drawCardLogic } = require("../../src/services/unoLogicService");

describe("UNO Logic Service (Features 1-4)", () => {
  const players = ["Alice", "Bob", "Charlie", "Diana"];

  test("1. Deve passar o turno no sentido horário", () => {
    const result = calculateNextTurn(players, 1);
    expect(result.nextPlayerIndex).toBe(2);
    expect(result.nextPlayer).toBe("Charlie");
  });

  test("2. Deve pular o jogador correto (Skip)", () => {
    const result = playCardLogic("skip", 2, players, "clockwise");
    expect(result.nextPlayerIndex).toBe(0); // 2 + 2 = 4 -> index 0
    expect(result.nextPlayer).toBe("Alice");
    expect(result.skippedPlayer).toBe("Diana"); // index 3
  });

  test("3. Deve inverter o sentido da partida (Reverse)", () => {
    const result = playCardLogic("reverse", 2, players, "clockwise");
    expect(result.newDirection).toBe("counterclockwise");
    expect(result.nextPlayerIndex).toBe(1);
    expect(result.nextPlayer).toBe("Bob");
  });

  test("4. Deve comprar carta e avaliar se é jogável", () => {
    const playerHand = ["red_2", "blue_5"];
    const deck = ["yellow_skip", "red_9"];
    const currentCard = "blue_7";

    const result = drawCardLogic(playerHand, deck, currentCard);
    
    // Assumindo que comprou yellow_skip e não pôde jogar
    expect(result.newHand).toContain("yellow_skip");
    expect(result.drawnCard).toBe("yellow_skip");
    expect(result.playable).toBe(false);
  });
});