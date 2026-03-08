export default function GameResultModal({ winnerName, onBackLobby }) {
  return (
    <div className="game-result-overlay">
      <div className="game-result-modal">
        <h2>Partida encerrada</h2>
        <p>
          Vencedor: <strong>{winnerName || "Jogador vencedor"}</strong>
        </p>
        <p>Você será redirecionado para o lobby.</p>
        <button onClick={onBackLobby}>Voltar agora</button>
      </div>
    </div>
  );
}