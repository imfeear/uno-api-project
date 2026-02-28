const repo = require("../repositories/scoreRepository");

function validateCreate(payload) {
  const { playerId, gameId, score } = payload;
  if (!Number.isInteger(playerId)) return "playerId must be an integer";
  if (!Number.isInteger(gameId)) return "gameId must be an integer";
  if (!Number.isInteger(score)) return "score must be an integer";
  return null;
}

async function create(payload) {
  const err = validateCreate(payload);
  if (err) return { error: err, status: 400 };

  const playerOk = await repo.playerExists(payload.playerId);
  if (!playerOk) return { error: "playerId not found", status: 404 };

  const gameOk = await repo.gameExists(payload.gameId);
  if (!gameOk) return { error: "gameId not found", status: 404 };

  const created = await repo.create(payload);
  return { data: created, status: 201 };
}

async function getById(id) {
  const entity = await repo.findById(id);
  if (!entity) return { error: "score not found", status: 404 };
  return { data: entity, status: 200 };
}

async function list() {
  const items = await repo.findAll();
  return { data: items, status: 200 };
}

async function update(id, payload) {
  if (payload.playerId !== undefined) {
    if (!Number.isInteger(payload.playerId)) return { error: "playerId must be an integer", status: 400 };
    const ok = await repo.playerExists(payload.playerId);
    if (!ok) return { error: "playerId not found", status: 404 };
  }
  if (payload.gameId !== undefined) {
    if (!Number.isInteger(payload.gameId)) return { error: "gameId must be an integer", status: 400 };
    const ok = await repo.gameExists(payload.gameId);
    if (!ok) return { error: "gameId not found", status: 404 };
  }
  if (payload.score !== undefined && !Number.isInteger(payload.score)) {
    return { error: "score must be an integer", status: 400 };
  }

  const entity = await repo.update(id, payload);
  if (!entity) return { error: "score not found", status: 404 };
  return { data: entity, status: 200 };
}

async function remove(id) {
  const ok = await repo.remove(id);
  if (!ok) return { error: "score not found", status: 404 };
  return { status: 204 };
}

// Feature 14
async function getCurrentScores(gameId) {
  const id = Number(gameId);
  if (!gameId || Number.isNaN(id)) {
    return { error: "game_id is required", status: 400 };
  }

  const gameOk = await repo.gameExists(id);
  if (!gameOk) return { error: "Game not found", status: 404 };

  const items = await repo.findByGameWithPlayer(id);

  const scores = {};
  const seen = new Set();

  for (const s of items) {
    if (seen.has(s.playerId)) continue;
    seen.add(s.playerId);

    const playerName = s.player ? s.player.name : `Player ${s.playerId}`;
    scores[playerName] = s.score;
  }

  return { data: { game_id: id, scores }, status: 200 };
}

module.exports = { create, getById, list, update, remove, getCurrentScores };
