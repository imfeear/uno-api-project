import { api } from "./client";

export function listScores() {
  return api.get("/scores");
}

export function getScoresByGame(gameId) {
  return api.get(`/scores/game/${gameId}`);
}

export function getScoresByUser(userId) {
  return api.get(`/scores/user/${userId}`);
}