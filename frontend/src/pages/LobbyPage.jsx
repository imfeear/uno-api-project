import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLobby, deleteGame, joinLobby, listGames } from "../api/lobby";

function normalizeGames(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.games)) return data.games;
  return [];
}

export default function LobbyPage() {
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    rules: "",
    max_players: 4
  });

  function handleChange(e) {
    setForm((old) => ({
      ...old,
      [e.target.name]: e.target.value
    }));
  }

  async function cleanupExpiredInProgressGames(gameList) {
    const now = Date.now();

    const gamesToDelete = gameList.filter((game) => {
      if (game.status !== "in_progress") return false;
      if (!game.startedAt) return false;

      const startedAtMs = new Date(game.startedAt).getTime();
      const tenMinutes = 10 * 60 * 1000;

      return now - startedAtMs > tenMinutes;
    });

    if (gamesToDelete.length === 0) {
      return;
    }

    await Promise.allSettled(
      gamesToDelete.map((game) => deleteGame(game.id))
    );
  }

  function filterVisibleGames(gameList) {
    const now = Date.now();

    return gameList.filter((game) => {
      if (game.status === "finished") {
        return false;
      }

      if (game.status === "in_progress" && game.startedAt) {
        const startedAtMs = new Date(game.startedAt).getTime();
        const tenMinutes = 10 * 60 * 1000;

        return now - startedAtMs <= tenMinutes;
      }

      return true;
    });
  }

  async function loadGames() {
    try {
      setLoading(true);
      setError("");
      setInfo("");

      const data = await listGames();
      const normalizedGames = normalizeGames(data);

      await cleanupExpiredInProgressGames(normalizedGames);

      const refreshed = await listGames();
      const refreshedGames = normalizeGames(refreshed);

      setGames(filterVisibleGames(refreshedGames));
    } catch (err) {
      setError(err.message || "Não foi possível carregar as partidas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGames();

    const interval = setInterval(() => {
      loadGames();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    try {
      const data = await createLobby({
        name: form.name,
        rules: form.rules,
        max_players: Number(form.max_players)
      });

      setInfo("Sala criada com sucesso.");
      navigate(`/lobby/${data.game_id}`);
    } catch (err) {
      setError(err.message || "Não foi possível criar a sala.");
    }
  }

  async function handleJoin(gameId) {
    setError("");
    setInfo("");

    try {
      await joinLobby(Number(gameId));
      setInfo("Você entrou na sala.");
      navigate(`/lobby/${gameId}`);
    } catch (err) {
      setError(err.message || "Não foi possível entrar na sala.");
    }
  }

  return (
    <div className="grid-two">
      <section className="card">
        <h2>Criar lobby</h2>

        <form onSubmit={handleCreate} className="form-col">
          <input
            name="name"
            placeholder="Nome da sala"
            value={form.name}
            onChange={handleChange}
          />

          <input
            name="rules"
            placeholder="Regras"
            value={form.rules}
            onChange={handleChange}
          />

          <input
            name="max_players"
            type="number"
            min="2"
            max="10"
            value={form.max_players}
            onChange={handleChange}
          />

          <button>Criar sala</button>
        </form>

        {error && <p className="error">{error}</p>}
        {info && <p className="success">{info}</p>}
      </section>

      <section className="card">
        <div className="row-between">
          <h2>Partidas disponíveis</h2>
          <button onClick={loadGames}>Atualizar</button>
        </div>

        {loading ? (
          <p>Carregando partidas...</p>
        ) : games.length === 0 ? (
          <p>Nenhuma partida disponível.</p>
        ) : (
          <div className="list">
            {games.map((game) => (
              <div key={game.id} className="list-item">
                <div>
                  <strong>{game.title || game.name}</strong>
                  <p>Status: {game.status}</p>
                  <p>Máx jogadores: {game.maxPlayers || game.max_players}</p>
                </div>

                <div className="actions">
                  <button onClick={() => navigate(`/lobby/${game.id}`)}>
                    Ver sala
                  </button>
                  <button onClick={() => handleJoin(game.id)}>
                    Entrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}