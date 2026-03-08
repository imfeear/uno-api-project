import { api } from "./client";

export function listScores() {
  return api.get("/scores");
}

export function getCurrentGameScores(gameId) {
  return api.post("/games/scores", {
    game_id: Number(gameId)
  });
}