const unoLogicService = require("../services/unoLogicService");

function nextTurn(req, res) {
  const { players, currentPlayerIndex } = req.body;
  const result = unoLogicService.calculateNextTurn(players, currentPlayerIndex);
  
  return res.status(200).json({
    status: 200,
    body: result
  });
}

function playCard(req, res) {
  const { cardPlayed, currentPlayerIndex, players, direction } = req.body;
  const result = unoLogicService.playCardLogic(cardPlayed, currentPlayerIndex, players, direction);
  
  return res.status(200).json({
    status: 200,
    body: result
  });
}

function drawCard(req, res) {
  const { playerHand, deck, currentCard } = req.body;
  const result = unoLogicService.drawCardLogic(playerHand, deck, currentCard);
  
  return res.status(200).json({
    status: 200,
    body: result
  });
}

module.exports = { nextTurn, playCard, drawCard };