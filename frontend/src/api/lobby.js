import { api } from "./client";

export function listGames() {
  return api.get("/games");
}

export function createLobby(payload) {
  return api.post("/game-lobby/create", payload);
}

export function joinLobby(game_id) {
  return api.post("/game-lobby/join", { game_id });
}

export function readyLobby(game_id) {
  return api.post("/game-lobby/ready", { game_id });
}

export function startLobby(game_id) {
  return api.post("/game-lobby/start", { game_id });
}

export function leaveLobby(game_id) {
  return api.post("/game-lobby/leave", { game_id });
}

export function endLobby(game_id) {
  return api.post("/game-lobby/end", { game_id });
}

export function getLobbyState(game_id) {
  return api.post("/game-lobby/state", { game_id });
}