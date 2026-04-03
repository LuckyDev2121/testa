import "./App.css";
import { GameCard } from "./features/game/components/GameCard";
import { useGameRealtime } from "./features/game/hooks/useGameRealtime";

function App() {
  const { connectionLabel, gameName } = useGameRealtime();

  return (
    <main className="app-shell">
      <GameCard connectionLabel={connectionLabel} gameName={gameName} />
    </main>
  );
}

export default App;
