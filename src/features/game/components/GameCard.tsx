type GameCardProps = {
  connectionLabel: string;
  gameName: string;
};

export function GameCard({ connectionLabel, gameName }: GameCardProps) {
  return (
    <section className="name-card" aria-live="polite">
      <p className="status-label">{connectionLabel}</p>
      <div className="game-name">{gameName}</div>
    </section>
  );
}
