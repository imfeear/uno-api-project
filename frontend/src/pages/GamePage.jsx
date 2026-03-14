import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  challengeUno,
  declareUno,
  drawCard,
  getGameHistory,
  getRealtimeState,
  playCard
} from "../api/realtimeGame";
import { getCurrentGameScores } from "../api/score";
import { useAuth } from "../context/AuthContext";
import { useSocketContext } from "../context/SocketContext";
import UnoCard from "../components/UnoCard";
import PlayerHandBack from "../components/PlayerHandBack";
import GameResultModal from "../components/GameResultModal";

function isWildCard(card) {
  return card?.value === "wild" || card?.value === "wild_draw4";
}

function getPlayerId(player) {
  return player.userId ?? player.id;
}

function getWinnerName(state) {
  const winner = state?.players?.find(
    (player) =>
      player.userId === state?.winnerUserId ||
      player.id === state?.winnerUserId
  );

  return winner?.username || `Usuário ${state?.winnerUserId}`;
}

function getCurrentPlayerName(state) {
  const current = state?.players?.find((player) => player.isCurrentTurn);
  return current?.username || "-";
}

function normalizeScores(data) {
  if (!data) return [];

  if (Array.isArray(data?.scores)) {
    return data.scores.map((item) => ({
      name: item.name || item.username || `Jogador ${item.playerId ?? ""}`,
      points: item.points ?? item.score ?? 0
    }));
  }

  if (data?.scores && typeof data.scores === "object") {
    return Object.entries(data.scores).map(([name, points]) => ({
      name,
      points
    }));
  }

  return [];
}

function getNiceMessage(err) {
  const text = err?.message || "Ocorreu um erro.";

  const lower = text.toLowerCase();

  if (lower.includes("not your turn")) return "Ainda não é a sua vez.";
  if (lower.includes("invalid move")) return "Essa carta não pode ser jogada agora.";
  if (lower.includes("invalid card")) return "Selecione uma carta válida.";
  if (lower.includes("wild")) return "Escolha uma cor antes de jogar essa carta.";
  if (lower.includes("playable card")) return "Você já tem uma carta jogável e precisa jogá-la.";
  if (lower.includes("uno")) return text;

  return text;
}

function HistoryList({ history }) {
  if (!history?.length) {
    return <p>Nenhum movimento registrado ainda.</p>;
  }

  return (
    <div className="log-box">
      {history
        .slice()
        .reverse()
        .map((item, index) => (
          <p key={`${item.createdAt}-${index}`}>
            {new Date(item.createdAt).toLocaleTimeString()} - {item.message || item.type}
          </p>
        ))}
    </div>
  );
}

export default function GamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { connect, connected } = useSocketContext();

  const [state, setState] = useState(null);

  useEffect(() => {
  setState({
    status: "playing",
    direction: 1,
    topCard: { color: "red", value: "5" },
    players: [
      { id: 1, username: "Player 1", handCount: 5, isCurrentTurn: true },
      { id: 2, username: "Player 2", handCount: 4 }
    ],
    myHand: [
      { color: "red", value: "3" },
      { color: "blue", value: "7" },
      { color: "green", value: "skip" },
      { color: "yellow", value: "2" }
    ]
  });
}, []);

  const [history, setHistory] = useState([]);
  const [scores, setScores] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [chosenColor, setChosenColor] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const endRedirectRef = useRef(null);

  const numericGameId = useMemo(() => Number(gameId || 1), [gameId]);

  const players = state?.players || [];
  const myPlayer = players.find((p) => getPlayerId(p) === user?.id);
  const isMyTurn = !!myPlayer?.isCurrentTurn;
  const otherPlayers = players.filter((p) => getPlayerId(p) !== user?.id);

  async function loadState() {
    try {
      setError("");
      const data = await getRealtimeState(numericGameId);
      setState(data);
    } catch (err) {
      setError(getNiceMessage(err));
    }
  }

  async function loadHistory() {
    try {
      const data = await getGameHistory(numericGameId);
      setHistory(data?.history || []);
    } catch {
      setHistory([]);
    }
  }

  async function loadScores() {
    try {
      const data = await getCurrentGameScores(numericGameId);
      setScores(normalizeScores(data));
    } catch {
      setScores([]);
    }
  }

  async function refreshAll() {
    return;
  }

  function handleEndGameRedirect() {
    navigate("/lobby", { replace: true });
  }

  useEffect(() => {
    refreshAll();
  }, [numericGameId]);

  useEffect(() => {
    if (!state) return;

    const ended =
      !!state.winnerUserId ||
      state.status === "finished" ||
      state.status === "ended";

    if (ended) {
      setShowResult(true);

      if (endRedirectRef.current) {
        clearTimeout(endRedirectRef.current);
      }

      endRedirectRef.current = setTimeout(() => {
        handleEndGameRedirect();
      }, 3500);
    }

    return () => {
      if (endRedirectRef.current) {
        clearTimeout(endRedirectRef.current);
      }
    };
  }, [state]);

  useEffect(() => {
    const socket = connect(token);

    function onGameState(data) {
      if (Number(data.gameId) !== numericGameId) return;
      setState(data);

      if (Array.isArray(data.history)) {
        setHistory(data.history);
      }
    }

    function onPrivateGameState(data) {
      if (Number(data.gameId) !== numericGameId) return;
      setState(data);

      if (Array.isArray(data.history)) {
        setHistory(data.history);
      }
    }

    function onGameEvent(event) {
      if (Number(event.gameId) !== numericGameId) return;

      const type = String(event.type || "").toLowerCase();

      if (type.includes("card_played")) {
        setMessage("Carta jogada com sucesso.");
      } else if (type.includes("card_drawn")) {
        setMessage("Carta comprada com sucesso.");
      } else if (type.includes("uno_declared")) {
        setMessage("UNO declarado com sucesso.");
      } else if (type.includes("uno_challenged")) {
        setMessage("Penalidade de UNO aplicada.");
      } else if (type.includes("game_finished")) {
        setMessage("A partida foi encerrada.");
      }

      refreshAll();
    }

    socket.on("game_state", onGameState);
    socket.on("private_game_state", onPrivateGameState);
    socket.on("game_event", onGameEvent);

    socket.emit("join_game_room", { game_id: numericGameId });
    socket.emit("request_game_state", { game_id: numericGameId });

    return () => {
      socket.emit("leave_game_room", { game_id: numericGameId });
      socket.off("game_state", onGameState);
      socket.off("private_game_state", onPrivateGameState);
      socket.off("game_event", onGameEvent);
    };
  }, [numericGameId, token]);

  function handleSelectCard(card, index) {
    if (!isMyTurn) {
      setError("Ainda não é a sua vez.");
      return;
    }

    setSelectedIndex(index);
    setSelectedCard(card);
    setMessage("Carta selecionada.");
    setError("");
  }

  async function handlePlaySelected() {
    if (selectedIndex === null || !selectedCard) {
      setError("Selecione uma carta antes de jogar.");
      return;
    }

    if (isWildCard(selectedCard) && !chosenColor) {
      setError("Escolha uma cor antes de jogar uma carta coringa.");
      return;
    }

    try {
      setIsPlaying(true);
      setError("");
      setMessage("Jogando carta...");

      await playCard(
        numericGameId,
        selectedIndex,
        isWildCard(selectedCard) ? chosenColor : ""
      );

      setSelectedCard(null);
      setSelectedIndex(null);
      setChosenColor("");
      await refreshAll();
      setMessage("Carta enviada para a pilha.");
    } catch (err) {
      setError(getNiceMessage(err));
      setMessage("");
    } finally {
      setIsPlaying(false);
    }
  }

  async function handleDraw() {
    try {
      setError("");
      setMessage("Comprando carta...");
      await drawCard(numericGameId);
      setSelectedCard(null);
      setSelectedIndex(null);
      await refreshAll();
      setMessage("Carta comprada.");
    } catch (err) {
      setError(getNiceMessage(err));
      setMessage("");
    }
  }

  async function handleUno() {
    try {
      setError("");
      setMessage("Declarando UNO...");
      await declareUno(numericGameId);
      await refreshAll();
      setMessage("UNO declarado com sucesso.");
    } catch (err) {
      setError(getNiceMessage(err));
      setMessage("");
    }
  }

  async function handleChallengeUno(targetUserId) {
    try {
      setError("");
      setMessage("Aplicando desafio de UNO...");
      await challengeUno(numericGameId, targetUserId);
      await refreshAll();
      setMessage("Desafio de UNO aplicado com sucesso.");
    } catch (err) {
      setError(getNiceMessage(err));
      setMessage("");
    }
  }

  return (
    <div className="game-table-page">
      {showResult && (
        <GameResultModal
          winnerName={getWinnerName(state)}
          onBackLobby={handleEndGameRedirect}
        />
      )}

      <div className="game-top-info">
        <div className="table-badge">Partida #{gameId}</div>
        <div className="table-badge">{connected ? "Socket conectado" : "Socket desconectado"}</div>
        <div className="table-badge">Status: {state?.status || "-"}</div>
        <div className="table-badge">Direção: {state?.direction === 1 ? "Horário" : "Anti-horário"}</div>
        <div className="table-badge">
          Topo do descarte: {state?.topCard ? `${state.topCard.color} ${state.topCard.value}` : "-"}
        </div>
        <div className="table-badge">
          Jogador atual: {getCurrentPlayerName(state)}
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <section className="uno-table">
        <div className="opponents-zone">
          {otherPlayers.map((player) => (
            <div
              key={getPlayerId(player)}
              className={`opponent-seat ${player.isCurrentTurn ? "active-seat" : ""}`}
            >
              <div className="opponent-header">
                <strong>{player.username}</strong>
                <span>{player.isCurrentTurn ? "Turno atual" : "Aguardando"}</span>
              </div>

              <PlayerHandBack count={player.handCount || 0} />

              <div className="opponent-meta">
                <span>Cartas: {player.handCount}</span>
                <span>{player.unoDeclared ? "UNO declarado" : player.mustDeclareUno ? "Pode ser desafiado" : ""}</span>
              </div>

              {player.mustDeclareUno && !player.unoDeclared && (
                <button
                  className="table-action-button"
                  onClick={() => handleChallengeUno(getPlayerId(player))}
                >
                  Desafiar UNO
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="center-board">
          <div className="deck-area">
            <div className="deck-stack" onClick={handleDraw}>
              <div className="deck-card layer3" />
              <div className="deck-card layer2" />
              <div className="deck-card layer1" />
              <div className={`deck-card front ${!isMyTurn ? "deck-disabled" : ""}`}>
                <div className="deck-label">BARALHO</div>
              </div>
            </div>

            <button className="table-action-button" onClick={handleDraw} disabled={!isMyTurn}>
              Comprar carta
            </button>
          </div>

          <div className="discard-area">
            <div className="discard-stack animated-discard">
              {selectedCard ? (
                <UnoCard
                  color={selectedCard.color}
                  value={selectedCard.value}
                  selected
                />
              ) : state?.topCard ? (
                <UnoCard
                  color={state.topCard.color}
                  value={state.topCard.value}
                />
              ) : (
                <div className="empty-discard">Sem carta</div>
              )}
            </div>

            <button
              className="table-action-button"
              onClick={handlePlaySelected}
              disabled={!isMyTurn || !selectedCard || isPlaying}
            >
              Jogar carta
            </button>
          </div>
        </div>

        <div className="bottom-zone">
          <div className={`player-panel ${isMyTurn ? "my-turn-panel" : ""}`}>
            <div className="player-panel-header">
              <div>
                <h2>{myPlayer?.username || "Meu jogador"}</h2>
                <p>
                  {isMyTurn ? "Sua vez de jogar" : "Aguardando sua vez"} | Cartas: {state?.myHand?.length || 0}
                </p>
              </div>

              <div className="player-actions">
                <button onClick={handleUno}>Declarar UNO</button>
                <button onClick={refreshAll}>Atualizar</button>
              </div>
            </div>

            {state?.mustDeclareUno && (
              <p className="warning">Você está com 1 carta. Declare UNO agora.</p>
            )}

            <div className="chosen-color-box">
              <label>Cor para coringa</label>
              <select value={chosenColor} onChange={(e) => setChosenColor(e.target.value)}>
                <option value="">Selecione</option>
                <option value="red">Vermelho</option>
                <option value="yellow">Amarelo</option>
                <option value="green">Verde</option>
                <option value="blue">Azul</option>
              </select>
            </div>

            <div className="selected-card-preview">
              <h3>Carta selecionada</h3>
              <div className="selected-card-box">
                {selectedCard ? (
                  <UnoCard color={selectedCard.color} value={selectedCard.value} />
                ) : (
                  <div className="empty-selected-card">Nenhuma carta selecionada</div>
                )}
              </div>
            </div>

            <div className="my-hand-fan">
              {state?.myHand?.map((card, index) => (
                <div
                  key={`${card.color}-${card.value}-${index}`}
                  className="my-hand-card-wrapper"
                  style={{
                    transform: `translateY(${selectedIndex === index ? "-18px" : "0px"}) rotate(${(index - (state.myHand.length - 1) / 2) * 3}deg)`
                  }}
                >
                  <UnoCard
                    color={card.color}
                    value={card.value}
                    selected={selectedIndex === index}
                    playable={isMyTurn}
                    onClick={() => handleSelectCard(card, index)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid-two">
        <div className="card">
          <h3>Jogadores da partida</h3>
          <div className="list">
            {players.map((player) => (
              <div key={getPlayerId(player)} className="list-item">
                <div>
                  <strong>{player.username}</strong>
                  <p>ID: {getPlayerId(player)}</p>
                </div>
                <div>
                  <p>{player.isCurrentTurn ? "Turno atual" : "Aguardando"}</p>
                  <p>Cartas: {player.handCount ?? 0}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Pontuações atuais</h3>
          {scores.length === 0 ? (
            <p>Nenhuma pontuação disponível para esta partida.</p>
          ) : (
            <div className="score-list">
              {scores.map((item, index) => (
                <div className="score-card" key={`${item.name}-${index}`}>
                  <h3>{item.name}</h3>
                  <p><strong>Pontos:</strong> {item.points}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="card game-events-card">
        <h3>Histórico de movimentos</h3>
        <HistoryList history={history} />
      </section>
    </div>
  );
}