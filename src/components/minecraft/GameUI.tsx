import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Block } from "./types";

interface GameUIProps {
  isOnline: boolean;
  roomCode: string;
  playerName: string;
  onlinePlayerCount: number;
  playTime: number;
  selectedBlock: Block["type"];
  onBlockSelect: (type: Block["type"]) => void;
  onShowJoinRoom: () => void;
  onLeaveRoom: () => void;
  onBack: () => void;
  isMobile: boolean;
  gameMode: '2d' | '3d';
  onToggleGameMode: () => void;
}

const GameUI = ({
  isOnline,
  roomCode,
  playerName,
  onlinePlayerCount,
  playTime,
  selectedBlock,
  onBlockSelect,
  onShowJoinRoom,
  onLeaveRoom,
  onBack,
  isMobile,
  gameMode,
  onToggleGameMode
}: GameUIProps) => {
  const blockTypes: Block["type"][] = ["cobblestone", "dirt", "stone", "grass"];

  return (
    <>
      <div className="fixed top-4 left-4 z-30 bg-black/50 text-white px-4 py-2 rounded-lg">
        <div className="text-sm">
          {!isMobile && (
            <>
              WASD - движение | Пробел - прыжок
              <br />
            </>
          )}
          ЛКМ - убрать блок | ПКМ - поставить блок
          <br />
          До викторины: {Math.floor((300 - playTime) / 60)}:
          {String((300 - playTime) % 60).padStart(2, "0")}
        </div>
        {isOnline && (
          <div className="mt-2 text-green-400">
            🟢 Онлайн | Комната: {roomCode} | Игрок: {playerName} | В сети: {onlinePlayerCount}
          </div>
        )}
      </div>

      <div className="fixed top-4 right-4 z-30 flex gap-2">
        <Button 
          onClick={onToggleGameMode} 
          variant="outline" 
          className="bg-purple-500 text-white hover:bg-purple-600"
        >
          {gameMode === '3d' ? '🎮 3D' : '🕹️ 2D'}
        </Button>
        {!isOnline ? (
          <Button onClick={onShowJoinRoom} variant="outline" className="bg-blue-500 text-white hover:bg-blue-600">
            <Icon name="Users" className="mr-2" />
            Играть вместе
          </Button>
        ) : (
          <Button onClick={onLeaveRoom} variant="outline" className="bg-red-500 text-white hover:bg-red-600">
            Выйти из комнаты
          </Button>
        )}
        <Button onClick={onBack} variant="outline">
          <Icon name="Home" />
        </Button>
      </div>

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex gap-2 bg-black/50 p-2 rounded-lg">
        {blockTypes.map((type) => (
          <button
            key={type}
            onClick={() => onBlockSelect(type)}
            className={`w-16 h-16 rounded border-2 transition-all ${
              selectedBlock === type ? "border-white scale-110" : "border-gray-600"
            }`}
            style={{
              background:
                type === "grass"
                  ? "#5DA847"
                  : type === "dirt"
                  ? "#8B6914"
                  : type === "stone"
                  ? "#7A7A7A"
                  : "#808080",
            }}
          >
            <div className="text-white text-xs font-bold">
              {type === "grass" && "🌱"}
              {type === "dirt" && "🟤"}
              {type === "stone" && "⚪"}
              {type === "cobblestone" && "⬜"}
            </div>
          </button>
        ))}
      </div>
    </>
  );
};

export default GameUI;