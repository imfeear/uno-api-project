import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div>
      <header className="topbar">
        <div className="brand">UNO Project</div>

        <nav className="nav">
          <Link to="/lobby">Lobby</Link>
          <Link to="/scores">Scores</Link>
          <Link to="/profile">Perfil</Link>
        </nav>

        <div className="userbox">
          <span>{user?.username}</span>
          <button onClick={handleLogout}>Sair</button>
        </div>
      </header>

      <main className="container">{children}</main>
    </div>
  );
}