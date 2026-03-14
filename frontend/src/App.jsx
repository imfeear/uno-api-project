import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LobbyPage from "./pages/LobbyPage";
import LobbyRoomPage from "./pages/LobbyRoomPage";
import GamePage from "./pages/GamePage";
import ProfilePage from "./pages/ProfilePage";
import ScorePage from "./pages/ScorePage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/lobby" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/lobby"
        element={
          <ProtectedRoute>
            <Layout>
              <LobbyPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/lobby/:gameId"
        element={
          <ProtectedRoute>
            <Layout>
              <LobbyRoomPage />
            </Layout>
          </ProtectedRoute>
        }
      />

    <Route
      path="/game"
      element={
        <Layout>
          <GamePage />
        </Layout>
      }
    />


      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/scores"
        element={
          <ProtectedRoute>
            <Layout>
              <ScorePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}