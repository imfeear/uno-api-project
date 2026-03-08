import { api } from "./client";

export function getRealtimeState(game_id) {
  return api.post("/realtime-game/state", { game_id });
}

export function playCard(game_id, card_index, chosen_color = "") {
  return api.post("/realtime-game/play", {
    game_id,
    card_index,
    chosen_color
  });
}

export function drawCard(game_id) {
  return api.post("/realtime-game/draw", { game_id });
}

export function declareUno(game_id) {
  return api.post("/realtime-game/uno", { game_id });
}

export function challengeUno(game_id, target_user_id) {
  return api.post("/realtime-game/challenge-uno", {
    game_id,
    target_user_id
  });
}

export function getGameHistory(game_id) {
  return api.post("/realtime-game/history", { game_id });
}