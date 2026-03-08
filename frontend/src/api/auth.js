import { api } from "./client";

export function registerUser(payload) {
  return api.post("/auth/register", payload);
}

export function loginUser(payload) {
  return api.post("/auth/login", payload);
}

export function logoutUser(access_token) {
  return api.post("/auth/logout", { access_token });
}

export function getProfile() {
  return api.get("/users/profile");
}