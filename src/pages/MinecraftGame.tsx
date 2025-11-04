import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Block, Player, TouchControl, MathQuestion } from "@/components/minecraft/types";
import GameCanvas from "@/components/minecraft/GameCanvas";
import GameUI from "@/components/minecraft/GameUI";
import MathQuiz from "@/components/minecraft/MathQuiz";
import JoinRoomModal from "@/components/minecraft/JoinRoomModal";
import MobileControls from "@/components/minecraft/MobileControls";

const MinecraftGame = () => {
  const navigate = useNavigate();
  const [gameMode, setGameMode] = useState<'2d' | '3d' | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 2.7, z: 8 });
  const [playerRot, setPlayerRot] = useState({ yaw: 0, pitch: 0 });
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [playTime, setPlayTime] = useState(0);
  const [showMathQuiz, setShowMathQuiz] = useState(false);
  const [mathQuestion, setMathQuestion] = useState<MathQuestion>({ a: 0, b: 0 });
  const [mathAnswer, setMathAnswer] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  
  const [isMobile, setIsMobile] = useState(false);
  const [leftJoystick, setLeftJoystick] = useState<TouchControl>({ x: 0, y: 0, startX: 0, startY: 0, active: false });
  const [rightJoystick, setRightJoystick] = useState<TouchControl>({ x: 0, y: 0, startX: 0, startY: 0, active: false });
  
  const [isOnline, setIsOnline] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [otherPlayers, setOtherPlayers] = useState<Player[]>([]);
  const [myPlayerId, setMyPlayerId] = useState("");
  const [selectedBlock, setSelectedBlock] = useState<Block["type"]>("cobblestone");
  
  const syncIntervalRef = useRef<NodeJS.Timeout>();

  const BLOCK_SIZE = 1;
  const REACH_DISTANCE = 5;

  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    const savedBlocks = localStorage.getItem('minecraft_blocks');
    const savedPos = localStorage.getItem('minecraft_player_pos');
    
    if (savedBlocks) {
      setBlocks(JSON.parse(savedBlocks));
    } else {
      const groundBlocks: Block[] = [];
      for (let x = -15; x <= 15; x++) {
        for (let z = -15; z <= 15; z++) {
          groundBlocks.push({ x, y: 0, z, type: "grass" });
          if (Math.random() > 0.8) {
            const height = Math.floor(Math.random() * 2) + 1;
            for (let h = 1; h <= height; h++) {
              groundBlocks.push({ x, y: h, z, type: Math.random() > 0.5 ? "dirt" : "stone" });
            }
          }
        }
      }
      setBlocks(groundBlocks);
      localStorage.setItem('minecraft_blocks', JSON.stringify(groundBlocks));
    }
    
    if (savedPos) {
      setPlayerPos(JSON.parse(savedPos));
    }
  }, []);

  useEffect(() => {
    if (!showMathQuiz && !isPaused) {
      const timer = setInterval(() => {
        setPlayTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= 300) {
            const a = Math.floor(Math.random() * 9) + 2;
            const b = Math.floor(Math.random() * 9) + 2;
            setMathQuestion({ a, b });
            setShowMathQuiz(true);
            setIsPaused(true);
            return 0;
          }
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showMathQuiz, isPaused]);

  const handleMathSubmit = () => {
    const correct = parseInt(mathAnswer) === mathQuestion.a * mathQuestion.b;
    if (correct) {
      setShowMathQuiz(false);
      setIsPaused(false);
      setMathAnswer("");
    } else {
      alert("❌ Неправильно! Попробуй ещё раз.");
    }
  };

  const createRoom = async () => {
    if (!playerName.trim()) {
      alert("Введи своё имя!");
      return;
    }
    
    const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const playerId = Math.random().toString(36).substring(2, 15);
    
    try {
      const response = await fetch("https://functions.poehali.dev/9efa54f8-c221-4210-b84c-430ee21c3978", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          roomCode: newRoomCode,
          playerId,
          playerName: playerName.trim(),
          x: playerPos.x,
          y: playerPos.y,
          z: playerPos.z,
          yaw: playerRot.yaw,
          pitch: playerRot.pitch,
        }),
      });
      
      if (response.ok) {
        setRoomCode(newRoomCode);
        setMyPlayerId(playerId);
        setIsOnline(true);
        setShowJoinRoom(false);
        startSyncInterval();
      }
    } catch (error) {
      console.error("Ошибка создания комнаты:", error);
    }
  };

  const joinRoom = async () => {
    if (!playerName.trim() || !roomCode.trim()) {
      alert("Введи имя и код комнаты!");
      return;
    }
    
    const playerId = Math.random().toString(36).substring(2, 15);
    
    try {
      const response = await fetch("https://functions.poehali.dev/9efa54f8-c221-4210-b84c-430ee21c3978", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          roomCode: roomCode.toUpperCase(),
          playerId,
          playerName: playerName.trim(),
          x: playerPos.x,
          y: playerPos.y,
          z: playerPos.z,
          yaw: playerRot.yaw,
          pitch: playerRot.pitch,
        }),
      });
      
      if (response.ok) {
        setMyPlayerId(playerId);
        setIsOnline(true);
        setShowJoinRoom(false);
        setRoomCode(roomCode.toUpperCase());
        startSyncInterval();
      } else {
        alert("Комната не найдена!");
      }
    } catch (error) {
      console.error("Ошибка входа в комнату:", error);
    }
  };

  const startSyncInterval = () => {
    syncIntervalRef.current = setInterval(() => {
      syncPosition();
    }, 500);
  };

  const syncPosition = async () => {
    if (!isOnline || !myPlayerId) return;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch("https://functions.poehali.dev/9efa54f8-c221-4210-b84c-430ee21c3978", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          roomCode,
          playerId: myPlayerId,
          x: playerPos.x,
          y: playerPos.y,
          z: playerPos.z,
          yaw: playerRot.yaw,
          pitch: playerRot.pitch,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        const players: Player[] = data.players || [];
        setOtherPlayers(players.filter((p: Player) => p.id !== myPlayerId));
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log("Синхронизация пропущена (слабый интернет)");
      } else {
        console.error("Ошибка синхронизации:", error);
      }
    }
  };

  const leaveRoom = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }
    setIsOnline(false);
    setRoomCode("");
    setOtherPlayers([]);
    setMyPlayerId("");
  };

  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys((prev) => new Set(prev).add(e.key.toLowerCase()));
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys((prev) => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key.toLowerCase());
        return newKeys;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setPlayerPos((prev) => {
        let moveX = 0;
        let moveZ = 0;
        let moveY = prev.y;

        const speed = 0.1;

        if (isMobile && leftJoystick.active) {
          const dx = (leftJoystick.x - leftJoystick.startX) / 40;
          const dy = (leftJoystick.y - leftJoystick.startY) / 40;
          moveX = dx * speed;
          moveZ = dy * speed;
        } else {
          if (keys.has("w")) moveZ -= speed;
          if (keys.has("s")) moveZ += speed;
          if (keys.has("a")) moveX -= speed;
          if (keys.has("d")) moveX += speed;
          if (keys.has(" ")) moveY += 0.2;
        }

        const cosYaw = Math.cos(playerRot.yaw);
        const sinYaw = Math.sin(playerRot.yaw);
        const newX = prev.x + moveX * cosYaw - moveZ * sinYaw;
        const newZ = prev.z + moveX * sinYaw + moveZ * cosYaw;

        if (moveY > 1) moveY = Math.max(1, moveY - 0.05);

        const newPos = { x: newX, y: moveY, z: newZ };
        localStorage.setItem('minecraft_player_pos', JSON.stringify(newPos));
        return newPos;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [keys, playerRot.yaw, isPaused, isMobile, leftJoystick]);

  useEffect(() => {
    if (isMobile && rightJoystick.active) {
      const dx = (rightJoystick.x - rightJoystick.startX) / 100;
      const dy = (rightJoystick.y - rightJoystick.startY) / 100;
      
      setPlayerRot((prev) => ({
        yaw: prev.yaw - dx * 0.05,
        pitch: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, prev.pitch - dy * 0.05))
      }));
    }
  }, [rightJoystick, isMobile]);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isPointerLocked || isPaused) return;

    const sensitivity = 0.002;
    setPlayerRot((prev) => ({
      yaw: prev.yaw - e.movementX * sensitivity,
      pitch: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, prev.pitch - e.movementY * sensitivity)),
    }));
  };

  const handleCanvasClick = () => {
    const canvas = document.querySelector("canvas");
    if (canvas && !isPointerLocked && !isMobile) {
      canvas.requestPointerLock();
    }
  };

  const handleLeftTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    setLeftJoystick({ x, y, startX: x, startY: y, active: true });
  };

  const handleLeftTouchMove = (e: React.TouchEvent) => {
    if (!leftJoystick.active) return;
    const touch = e.touches[0];
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const dx = x - leftJoystick.startX;
    const dy = y - leftJoystick.startY;
    const maxDistance = 40;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxDistance) {
      const angle = Math.atan2(dy, dx);
      setLeftJoystick({ ...leftJoystick, x: leftJoystick.startX + Math.cos(angle) * maxDistance, y: leftJoystick.startY + Math.sin(angle) * maxDistance });
    } else {
      setLeftJoystick({ ...leftJoystick, x, y });
    }
  };

  const handleLeftTouchEnd = () => {
    setLeftJoystick({ x: 0, y: 0, startX: 0, startY: 0, active: false });
  };

  const handleRightTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    setRightJoystick({ x, y, startX: x, startY: y, active: true });
  };

  const handleRightTouchMove = (e: React.TouchEvent) => {
    if (!rightJoystick.active) return;
    const touch = e.touches[0];
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    setRightJoystick({ ...rightJoystick, x, y });
  };

  const handleRightTouchEnd = () => {
    setRightJoystick({ x: 0, y: 0, startX: 0, startY: 0, active: false });
  };

  const handleJump = () => {
    setPlayerPos((prev) => ({ ...prev, y: prev.y + 0.5 }));
  };

  const handlePlaceBlock = () => {
    const direction = {
      x: -Math.sin(playerRot.yaw) * Math.cos(playerRot.pitch),
      y: -Math.sin(playerRot.pitch),
      z: -Math.cos(playerRot.yaw) * Math.cos(playerRot.pitch),
    };

    for (let t = 0; t < REACH_DISTANCE; t += 0.1) {
      const checkX = Math.round(playerPos.x + direction.x * t);
      const checkY = Math.round(playerPos.y + direction.y * t);
      const checkZ = Math.round(playerPos.z + direction.z * t);

      const blockExists = blocks.some(
        (b) => b.x === checkX && b.y === checkY && b.z === checkZ
      );

      if (blockExists) {
        const placeX = Math.round(playerPos.x + direction.x * (t - 0.5));
        const placeY = Math.round(playerPos.y + direction.y * (t - 0.5));
        const placeZ = Math.round(playerPos.z + direction.z * (t - 0.5));

        if (!blocks.some((b) => b.x === placeX && b.y === placeY && b.z === placeZ)) {
          setBlocks((prev) => {
            const newBlocks = [...prev, { x: placeX, y: placeY, z: placeZ, type: selectedBlock }];
            localStorage.setItem('minecraft_blocks', JSON.stringify(newBlocks));
            return newBlocks;
          });
        }
        return;
      }
    }
  };

  const handleBreakBlock = () => {
    const direction = {
      x: -Math.sin(playerRot.yaw) * Math.cos(playerRot.pitch),
      y: -Math.sin(playerRot.pitch),
      z: -Math.cos(playerRot.yaw) * Math.cos(playerRot.pitch),
    };

    for (let t = 0; t < REACH_DISTANCE; t += 0.1) {
      const checkX = Math.round(playerPos.x + direction.x * t);
      const checkY = Math.round(playerPos.y + direction.y * t);
      const checkZ = Math.round(playerPos.z + direction.z * t);

      const blockIndex = blocks.findIndex(
        (b) => b.x === checkX && b.y === checkY && b.z === checkZ
      );

      if (blockIndex !== -1) {
        setBlocks((prev) => {
          const newBlocks = prev.filter((_, i) => i !== blockIndex);
          localStorage.setItem('minecraft_blocks', JSON.stringify(newBlocks));
          return newBlocks;
        });
        return;
      }
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!isPointerLocked || isPaused) return;
      
      if (e.button === 0) {
        handleBreakBlock();
      } else if (e.button === 2) {
        handlePlaceBlock();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      if (isPointerLocked) {
        handlePlaceBlock();
      }
    };

    window.addEventListener("click", handleClick);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [isPointerLocked, isPaused, blocks, playerPos, playerRot, selectedBlock]);

  if (!gameMode) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-sky-400 to-green-500">
        <div className="bg-black/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl max-w-md w-full mx-4">
          <h1 className="text-4xl font-bold text-white text-center mb-2">Minecraft</h1>
          <p className="text-gray-300 text-center mb-8">Выбери режим игры</p>
          
          <div className="space-y-4">
            <button
              onClick={() => setGameMode('3d')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-2xl mb-1">🎮 3D режим</div>
              <div className="text-sm text-green-200">Полное погружение с видом от первого лица</div>
            </button>
            
            <button
              onClick={() => setGameMode('2d')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-2xl mb-1">🕹️ 2D режим</div>
              <div className="text-sm text-blue-200">Классический вид сбоку (скоро)</div>
            </button>
          </div>
          
          <button
            onClick={() => navigate("/")}
            className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all"
          >
            ← Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden bg-black relative">
      <GameCanvas
        blocks={blocks}
        playerPos={playerPos}
        playerRot={playerRot}
        otherPlayers={otherPlayers}
        isPointerLocked={isPointerLocked}
        onPointerLockChange={setIsPointerLocked}
        onMouseMove={handleMouseMove}
        onCanvasClick={handleCanvasClick}
        isMobile={isMobile}
        gameMode={gameMode}
      />

      <GameUI
        isOnline={isOnline}
        roomCode={roomCode}
        playerName={playerName}
        onlinePlayerCount={otherPlayers.length + 1}
        playTime={playTime}
        selectedBlock={selectedBlock}
        onBlockSelect={setSelectedBlock}
        onShowJoinRoom={() => setShowJoinRoom(true)}
        onLeaveRoom={leaveRoom}
        onBack={() => navigate("/")}
        isMobile={isMobile}
      />

      {isMobile && (
        <MobileControls
          leftJoystick={leftJoystick}
          rightJoystick={rightJoystick}
          onLeftTouchStart={handleLeftTouchStart}
          onLeftTouchMove={handleLeftTouchMove}
          onLeftTouchEnd={handleLeftTouchEnd}
          onRightTouchStart={handleRightTouchStart}
          onRightTouchMove={handleRightTouchMove}
          onRightTouchEnd={handleRightTouchEnd}
          onJump={handleJump}
          onPlace={handlePlaceBlock}
          onBreak={handleBreakBlock}
        />
      )}

      {showMathQuiz && (
        <MathQuiz
          question={mathQuestion}
          answer={mathAnswer}
          onAnswerChange={setMathAnswer}
          onSubmit={handleMathSubmit}
        />
      )}

      {showJoinRoom && (
        <JoinRoomModal
          playerName={playerName}
          roomCode={roomCode}
          onPlayerNameChange={setPlayerName}
          onRoomCodeChange={setRoomCode}
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
          onClose={() => setShowJoinRoom(false)}
        />
      )}
    </div>
  );
};

export default MinecraftGame;