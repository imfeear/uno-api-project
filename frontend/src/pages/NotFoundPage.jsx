import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="page">
      <div className="card">
        <h1>Página não encontrada</h1>
        <Link to="/lobby">Ir para o lobby</Link>
      </div>
    </div>
  );
}