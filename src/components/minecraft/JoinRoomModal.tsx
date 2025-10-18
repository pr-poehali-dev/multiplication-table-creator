import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface JoinRoomModalProps {
  playerName: string;
  roomCode: string;
  onPlayerNameChange: (value: string) => void;
  onRoomCodeChange: (value: string) => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onClose: () => void;
}

const JoinRoomModal = ({
  playerName,
  roomCode,
  onPlayerNameChange,
  onRoomCodeChange,
  onCreateRoom,
  onJoinRoom,
  onClose
}: JoinRoomModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="p-8 max-w-md w-full bg-white">
        <h2 className="text-2xl font-bold mb-4 text-center">Играть вместе 🎮</h2>
        <Input
          type="text"
          value={playerName}
          onChange={(e) => onPlayerNameChange(e.target.value)}
          className="mb-4"
          placeholder="Твоё имя"
        />
        <Input
          type="text"
          value={roomCode}
          onChange={(e) => onRoomCodeChange(e.target.value.toUpperCase())}
          className="mb-4"
          placeholder="Код комнаты (для входа)"
        />
        <div className="flex gap-2 mb-4">
          <Button onClick={onJoinRoom} className="flex-1">
            Войти в комнату
          </Button>
          <Button onClick={onCreateRoom} variant="outline" className="flex-1">
            Создать комнату
          </Button>
        </div>
        <Button onClick={onClose} variant="ghost" className="w-full">
          Отмена
        </Button>
      </Card>
    </div>
  );
};

export default JoinRoomModal;
