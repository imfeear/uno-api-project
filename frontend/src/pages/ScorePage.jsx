import { useEffect, useMemo, useState } from "react";
import { listScores } from "../api/score";
import { useAuth } from "../context/AuthContext";

function normalizeScores(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.scores)) return data.scores;
  return [];
}

export default function ScorePage() {
  const { user } = useAuth();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadScores() {
    try {
      setLoading(true);
      setError("");
      const data = await listScores();
      setScores(normalizeScores(data));
    } catch (err) {
      setError(err.message || "Não foi possível carregar os scores.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadScores();
  }, []);

  const myScores = useMemo(() => {
    return scores.filter(
      (item) =>
        item.userId === user?.id ||
        item.user_id === user?.id ||
        item.username === user?.username
    );
  }, [scores, user]);

  return (
    <div className="grid-two">
      <section className="card">
        <div className="row-between">
          <h2>Meus scores</h2>
          <button onClick={loadScores}>Atualizar</button>
        </div>

        {loading ? (
          <p>Carregando scores...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : myScores.length === 0 ? (
          <p>Nenhum score encontrado para o seu usuário.</p>
        ) : (
          <div className="score-list">
            {myScores.map((item, index) => (
              <div key={item.id || index} className="score-card">
                <h3>{item.username || user?.username || "Jogador"}</h3>
                <p><strong>Pontos:</strong> {item.points ?? item.score ?? 0}</p>
                <p><strong>Partida:</strong> {item.gameId ?? item.game_id ?? "-"}</p>
                <p><strong>Posição:</strong> {item.position ?? "-"}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2>Ranking geral</h2>

        {loading ? (
          <p>Carregando ranking...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : scores.length === 0 ? (
          <p>Nenhum score disponível.</p>
        ) : (
          <div className="score-table-wrapper">
            <table className="score-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Jogador</th>
                  <th>Pontos</th>
                  <th>Partida</th>
                  <th>Posição</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{index + 1}</td>
                    <td>{item.username || item.userId || item.user_id || "-"}</td>
                    <td>{item.points ?? item.score ?? 0}</td>
                    <td>{item.gameId ?? item.game_id ?? "-"}</td>
                    <td>{item.position ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}