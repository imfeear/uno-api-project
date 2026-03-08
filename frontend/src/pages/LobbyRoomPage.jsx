import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  endLobby,
  getLobbyState,
  joinLobby,
  leaveLobby,
  readyLobby,
  startLobby
} from "../api/lobby";
import { useAuth } from "../context/AuthContext";
import { useSocketContext } from "../context/SocketContext";

export default function LobbyRoomPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { socketRef, connect, connected } = useSocketContext();

  const [snapshot, setSnapshot] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  const numericGameId = useMemo(() => Number(gameId), [gameId]);

  function addEvent(text) {
    setEvents((old) => [`${new Date().toLocaleTimeString()} - ${text}`, ...old]);
  }

  async function loadState() {
    try {
      setError("");
      const data = await getLobbyState(numericGameId);
      setSnapshot(data);

      if (data?.status === "in_progress") {
        navigate(`/game/${numericGameId}`);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadState();
  }, [numericGameId]);

  useEffect(() => {
    const socket = connect(token);

    function onLobbySnapshot(data) {
      if (Number(data.game_id) !== numericGameId) return;
      setSnapshot(data);
      addEvent("Lobby atualizado");

      if (data.status === "in_progress") {
        navigate(`/game/${numericGameId}`);
      }
    }

    function onGameEvent(event) {
      if (Number(event.gameId) !== numericGameId) return;
      addEvent(`${event.type}: ${event.message}`);
    }

    socket.on("lobby_snapshot", onLobbySnapshot);
    socket.on("game_event", onGameEvent);

    socket.emit("join_game_room", { game_id: numericGameId });

    return () => {
      socket.emit("leave_game_room", { game_id: numericGameId });
      socket.off("lobby_snapshot", onLobbySnapshot);
      socket.off("game_event", onGameEvent);
    };
  }, [numericGameId, token, navigate]);

  async function handleJoin() {
    try {
      await joinLobby(numericGameId);
      await loadState();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReady() {
    try {
      await readyLobby(numericGameId);
      await loadState();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleStart() {
    try {
      await startLobby(numericGameId);
      await loadState();
      navigate(`/game/${numericGameId}`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleLeave() {
    try {
      await leaveLobby(numericGameId);
      navigate("/lobby");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleEnd() {
    try {
      await endLobby(numericGameId);
      navigate("/lobby");
    } catch (err) {
      setError(err.message);
    }
  }

  const isCreator = snapshot?.creatorId === user?.id;

  return (
    <div className="grid-two">
      <section className="card">
        <div className="row-between">
          <h2>Sala #{gameId}</h2>
          <span>{connected ? "Socket conectado" : "Socket desconectado"}</span>
        </div>

        {error && <p className="error">{error}</p>}

        {!snapshot ? (
          <p>Carregando sala...</p>
        ) : (
          <>
            <p><strong>Título:</strong> {snapshot.title}</p>
            <p><strong>Status:</strong> {snapshot.status}</p>
            <p><strong>Regras:</strong> {snapshot.rules || "-"}</p>
            <p><strong>Máx jogadores:</strong> {snapshot.maxPlayers}</p>

            <div className="actions wrap-actions">
              <button onClick={loadState}>Atualizar</button>
              <button onClick={handleJoin}>Entrar</button>
              <button onClick={handleReady}>Marcar pronto</button>
              {isCreator && <button onClick={handleStart}>Iniciar jogo</button>}
              <button onClick={handleLeave}>Sair</button>
              {isCreator && <button onClick={handleEnd}>Encerrar</button>}
            </div>

            <h3>Jogadores</h3>
            <div className="list">
              {snapshot.players?.map((player) => (
                <div key={player.id} className="list-item">
                  <div>
                    <strong>{player.username}</strong>
                    <p>{player.email}</p>
                  </div>
                  <span>{player.isReady ? "Pronto" : "Não pronto"}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="card">
        <h2>Eventos</h2>
        <div className="log-box">
          {events.length === 0 ? (
            <p>Sem eventos.</p>
          ) : (
            events.map((item, index) => <p key={index}>{item}</p>)
          )}
        </div>
      </section>
    </div>
  );
}