function getSymbol(value) {
  if (value === "skip") return "Ø";
  if (value === "reverse") return "↺";
  if (value === "draw2") return "+2";
  if (value === "wild") return "W";
  if (value === "wild_draw4") return "+4";
  return String(value);
}

function getCardClass(color, value, hidden) {
  if (hidden) return "uno-card back";

  if (value === "wild" || value === "wild_draw4") {
    return "uno-card wild";
  }

  return `uno-card ${color || "neutral"}`;
}

export default function UnoCard({
  color,
  value,
  hidden = false,
  selected = false,
  playable = true,
  small = false,
  onClick
}) {
  const className = [
    getCardClass(color, value, hidden),
    selected ? "selected" : "",
    !playable ? "disabled-card" : "",
    small ? "small-card" : ""
  ]
    .filter(Boolean)
    .join(" ");

  if (hidden) {
    return (
      <button className={className} disabled>
        <div className="card-back-pattern" />
      </button>
    );
  }

  return (
    <button className={className} onClick={onClick}>
      <span className="card-corner top">{getSymbol(value)}</span>
      <div className="card-center">{getSymbol(value)}</div>
      <span className="card-corner bottom">{getSymbol(value)}</span>
    </button>
  );
}