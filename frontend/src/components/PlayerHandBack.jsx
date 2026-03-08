import UnoCard from "./UnoCard";

export default function PlayerHandBack({ count = 0 }) {
  const cards = Array.from({ length: count });

  return (
    <div className="player-back-hand">
      {cards.map((_, index) => (
        <div
          key={index}
          className="player-back-card-wrapper"
          style={{ left: `${index * 18}px`, zIndex: index + 1 }}
        >
          <UnoCard hidden small />
        </div>
      ))}
    </div>
  );
}