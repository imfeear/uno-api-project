import { useEffect, useMemo, useState } from "react";
import { getCurrentGameScores, listScores } from "../api/score";

function normalizeHistoricScores(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.scores)) return data.scores;
  return [];
}

function normalizeCurrentGameScores(data) {
  if (!data) return { gameId: "", scores: [] };

  const gameId = data.game_id ?? data.gameId ?? "";

  if (Array.isArray(data.scores)) {
    return {
      gameId,
      scores: data.scores
    };
  }

  if (data.scores && typeof data.scores === "object") {
    return {
      gameId,
      scores: Object.entries(data.scores).map(([name, points]) => ({
        name,
        points
      }))
    };
  }

  return {
    gameId,
    scores: []
  };
}

export default function ScorePage() {
  const [historicScores, setHistoricScores] = useState([]);
  const [currentGameResult, setCurrentGameResult] = useState(null);
  const [gameId, setGameId] = useState("");
  const [loadingHistoric, setLoadingHistoric] = useState(true);
  const [loadingCurrent, setLoadingCurrent] = useState(false);
  const [errorHistoric, setErrorHistoric] = useState("");
  const [errorCurrent, setErrorCurrent] = useState("");

  async function loadHistoricScores() {
    try {
      setLoadingHistoric(true);
      setErrorHistoric("");
      const data = await listScores();
      setHistoricScores(normalizeHistoricScores(data));
    } catch (err) {
      setErrorHistoric(err.message || "Não foi possível carregar os scores.");
    } finally {
      setLoadingHistoric(false);
    }
  }

  async function handleSearchCurrentScores(e) {
    e.preventDefault();

    if (!gameId) {
      setErrorCurrent("Informe o ID da partida.");
      setCurrentGameResult(null);
      return;
    }

    try {
      setLoadingCurrent(true);
      setErrorCurrent("");
      const data = await getCurrentGameScores(gameId);
      setCurrentGameResult(normalizeCurrentGameScores(data));
    } catch (err) {
      setErrorCurrent(err.message || "Não foi possível consultar o placar da partida.");
      setCurrentGameResult(null);
    } finally {
      setLoadingCurrent(false);
    }
  }

  useEffect(() => {
    loadHistoricScores();
  }, []);

  const orderedHistoricScores = useMemo(() => {
    return [...historicScores].sort((a, b) => {
      const scoreA = Number(a.score ?? a.points ?? 0);
      const scoreB = Number(b.score ?? b.points ?? 0);
      return scoreB - scoreA;
    });
  }, [historicScores]);

  return (
    <div className="grid-two">
      <section className="card">
        <div className="row-between">
          <h2>Placar por partida</h2>
        </div>

        <form onSubmit={handleSearchCurrentScores} className="form-col">
          <input
            type="number"
            min="1"
            placeholder="Digite o ID da partida"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
          />

          <button disabled={loadingCurrent}>
            {loadingCurrent ? "Consultando..." : "Consultar placar"}
          </button>
        </form>

        {errorCurrent && <p className="error">{errorCurrent}</p>}

        {!currentGameResult ? (
          <p>Informe o ID de uma partida para ver o placar atual.</p>
        ) : (
          <div className="score-result-block">
            <p>
              <strong>Partida:</strong> {currentGameResult.gameId || "-"}
            </p>

            {currentGameResult.scores.length === 0 ? (
              <p>Nenhum score encontrado para esta partida.</p>
            ) : (
              <div className="score-list">
                {currentGameResult.scores.map((item, index) => (
                  <div className="score-card" key={`${item.name}-${index}`}>
                    <h3>{item.name}</h3>
                    <p>
                      <strong>Pontos:</strong> {item.points}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <section className="card">
        <div className="row-between">
          <h2>Scores salvos</h2>
          <button onClick={loadHistoricScores}>Atualizar</button>
        </div>

        {loadingHistoric ? (
          <p>Carregando scores...</p>
        ) : errorHistoric ? (
          <p className="error">{errorHistoric}</p>
        ) : orderedHistoricScores.length === 0 ? (
          <p>Nenhum score salvo no banco.</p>
        ) : (
          <div className="score-table-wrapper">
            <table className="score-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Player ID</th>
                  <th>Game ID</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {orderedHistoricScores.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.playerId ?? "-"}</td>
                    <td>{item.gameId ?? "-"}</td>
                    <td>{item.score ?? 0}</td>
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