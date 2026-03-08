import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { declareUno, drawCard, getRealtimeState, playCard } from "../api/realtimeGame";
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

function getNiceMessage(err) {
  const text = err?.message || "Ocorreu um erro.";

  if (text.toLowerCase().includes("not your turn")) {
    return "Ainda não é a sua vez.";
  }

  if (text.toLowerCase().includes("invalid card")) {
    return "Essa carta não pode ser jogada agora.";
  }

  if (text.toLowerCase().includes("wild")) {
    return "Escolha uma cor antes de jogar essa carta.";
  }

  return text;
}

export default function GamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { connect, connected } = useSocketContext();

  const [state, setState] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [events, setEvents] = useState([]);
  const [chosenColor, setChosenColor] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const endRedirectRef = useRef(null);

  const numericGameId = useMemo(() => Number(gameId), [gameId]);

  function addEvent(text) {
    setEvents((old) => [`${new Date().toLocaleTimeString()} - ${text}`, ...old.slice(0, 14)]);
  }

  async function loadState() {
    try {
      setError("");
      const data = await getRealtimeState(numericGameId);
      setState(data);
    } catch (err) {
      setError(getNiceMessage(err));
    }
  }

  function handleEndGameRedirect() {
    navigate("/lobby", { replace: true });
  }

  useEffect(() => {
    loadState();
  }, [numericGameId]);

  useEffect(() => {
    if (!state) return;

    const ended = !!state.winnerUserId || state.status === "finished" || state.status === "ended";

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
      setState((old) => ({ ...old, ...data }));
      addEvent("Estado da mesa atualizado.");
    }

    function onPrivateGameState(data) {
      if (Number(data.gameId) !== numericGameId) return;
      setState(data);
      addEvent("Sua mão foi atualizada.");
    }

    function onGameEvent(event) {
      if (Number(event.gameId) !== numericGameId) return;

      const text = event.message || `${event.type}`;
      addEvent(text);

      if (event.type === "CARD_PLAYED") {
        setMessage("Carta jogada com sucesso.");
      }

      if (event.type === "CARD_DRAWN") {
        setMessage("Carta comprada com sucesso.");
      }

      if (event.type === "UNO_DECLARED") {
        setMessage("UNO declarado.");
      }

      if (event.type === "GAME_FINISHED" || event.type === "WINNER_DECLARED") {
        setMessage("A partida foi encerrada.");
      }
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

  const players = state?.players || [];
  const myPlayer = players.find((p) => getPlayerId(p) === user?.id);
  const isMyTurn = !!myPlayer?.isCurrentTurn;
  const otherPlayers = players.filter((p) => getPlayerId(p) !== user?.id);

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
      setMessage("Carta enviada para a pilha.");
      await loadState();
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
      await loadState();
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
      await loadState();
      setMessage("UNO declarado com sucesso.");
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
        <div className="table-badge">Carta do topo: {state?.topCard ? `${state.topCard.color} ${state.topCard.value}` : "-"}</div>
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
                <span>{player.unoDeclared ? "UNO declarado" : ""}</span>
              </div>
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
                <button onClick={loadState}>Atualizar</button>
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

      <section className="card game-events-card">
        <h3>Eventos da partida</h3>
        <div className="log-box">
          {events.length === 0 ? <p>Nenhum evento registrado ainda.</p> : events.map((item, index) => <p key={index}>{item}</p>)}
        </div>
      </section>
    </div>
  );
}