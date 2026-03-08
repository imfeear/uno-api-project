import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getProfile, loginUser, logoutUser, registerUser } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("uno_token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function saveToken(newToken) {
    localStorage.setItem("uno_token", newToken);
    setToken(newToken);
  }

  function clearAuth() {
    localStorage.removeItem("uno_token");
    setToken(null);
    setUser(null);
  }

  async function loadProfile() {
    try {
      const profile = await getProfile();
      setUser(profile);
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  }

  async function login(username, password) {
    const data = await loginUser({ username, password });
    saveToken(data.access_token);
    const profile = await getProfile();
    setUser(profile);
    return profile;
  }

  async function register(payload) {
    return registerUser(payload);
  }

  async function logout() {
    try {
      const currentToken = localStorage.getItem("uno_token");
      if (currentToken) {
        await logoutUser(currentToken);
      }
    } catch {
    } finally {
      clearAuth();
    }
  }

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    loadProfile();
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: !!token && !!user,
      login,
      register,
      logout,
      reloadProfile: loadProfile
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}