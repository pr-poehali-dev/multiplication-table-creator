import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

interface Block {
  x: number;
  y: number;
  z: number;
  type: "cobblestone";
}

const MinecraftGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 1.7, z: 5 });
  const [playerRot, setPlayerRot] = useState({ yaw: 0, pitch: 0 });
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [playTime, setPlayTime] = useState(0);
  const [showMathQuiz, setShowMathQuiz] = useState(false);
  const [mathQuestion, setMathQuestion] = useState({ a: 0, b: 0 });
  const [mathAnswer, setMathAnswer] = useState("");
  const [isPaused, setIsPaused] = useState(false);

  const BLOCK_SIZE = 1;
  const REACH_DISTANCE = 5;

  useEffect(() => {
    const groundBlocks: Block[] = [];
    for (let x = -10; x <= 10; x++) {
      for (let z = -10; z <= 10; z++) {
        groundBlocks.push({ x, y: 0, z, type: "cobblestone" });
      }
    }
    setBlocks(groundBlocks);
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
    if (!isPointerLocked || isPaused) return;

    const speed = 0.1;
    const interval = setInterval(() => {
      setPlayerPos((prev) => {
        let newX = prev.x;
        let newZ = prev.z;
        let newY = prev.y;

        if (keys.has("w")) {
          newX -= Math.sin(playerRot.yaw) * speed;
          newZ -= Math.cos(playerRot.yaw) * speed;
        }
        if (keys.has("s")) {
          newX += Math.sin(playerRot.yaw) * speed;
          newZ += Math.cos(playerRot.yaw) * speed;
        }
        if (keys.has("a")) {
          newX -= Math.cos(playerRot.yaw) * speed;
          newZ += Math.sin(playerRot.yaw) * speed;
        }
        if (keys.has("d")) {
          newX += Math.cos(playerRot.yaw) * speed;
          newZ -= Math.sin(playerRot.yaw) * speed;
        }
        if (keys.has(" ")) {
          newY += speed;
        }
        if (keys.has("shift")) {
          newY -= speed;
        }

        return { x: newX, y: newY, z: newZ };
      });
    }, 16);

    return () => clearInterval(interval);
  }, [keys, isPointerLocked, playerRot, isPaused]);

  const handleCanvasClick = () => {
    if (!canvasRef.current) return;
    canvasRef.current.requestPointerLock();
  };

  useEffect(() => {
    const handlePointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement === canvasRef.current);
    };
    document.addEventListener("pointerlockchange", handlePointerLockChange);
    return () => {
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
    };
  }, []);

  useEffect(() => {
    if (!isPointerLocked || isPaused) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPlayerRot((prev) => ({
        yaw: prev.yaw + e.movementX * 0.002,
        pitch: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, prev.pitch - e.movementY * 0.002)),
      }));
    };

    const handleClick = (e: MouseEvent) => {
      if (e.button === 0) {
        const hitBlock = raycast(true);
        if (hitBlock) {
          setBlocks((prev) => prev.filter((b) => !(b.x === hitBlock.x && b.y === hitBlock.y && b.z === hitBlock.z)));
        }
      } else if (e.button === 2) {
        e.preventDefault();
        const placePos = raycast(false);
        if (placePos) {
          setBlocks((prev) => [...prev, { ...placePos, type: "cobblestone" }]);
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("contextmenu", (e) => e.preventDefault());

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("contextmenu", (e) => e.preventDefault());
    };
  }, [isPointerLocked, blocks, playerPos, playerRot, isPaused]);

  const raycast = (forDestroy: boolean) => {
    const dir = {
      x: -Math.sin(playerRot.yaw) * Math.cos(playerRot.pitch),
      y: -Math.sin(playerRot.pitch),
      z: -Math.cos(playerRot.yaw) * Math.cos(playerRot.pitch),
    };

    let lastEmpty = null;
    for (let i = 0; i < REACH_DISTANCE * 10; i++) {
      const step = i * 0.1;
      const checkX = Math.floor(playerPos.x + dir.x * step);
      const checkY = Math.floor(playerPos.y + dir.y * step);
      const checkZ = Math.floor(playerPos.z + dir.z * step);

      const block = blocks.find((b) => b.x === checkX && b.y === checkY && b.z === checkZ);
      if (block) {
        return forDestroy ? block : lastEmpty;
      }
      lastEmpty = { x: checkX, y: checkY, z: checkZ };
    }
    return null;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      ctx.fillStyle = "#87CEEB";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#90EE90";
      ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

      const visibleBlocks = blocks
        .map((block) => {
          const dx = block.x - playerPos.x;
          const dy = block.y - playerPos.y;
          const dz = block.z - playerPos.z;

          const rotX = dx * Math.cos(playerRot.yaw) - dz * Math.sin(playerRot.yaw);
          const rotZ = dx * Math.sin(playerRot.yaw) + dz * Math.cos(playerRot.yaw);
          const rotY = dy * Math.cos(playerRot.pitch) - rotZ * Math.sin(playerRot.pitch);
          const finalZ = dy * Math.sin(playerRot.pitch) + rotZ * Math.cos(playerRot.pitch);

          if (finalZ <= 0.1) return null;

          const scale = 400 / finalZ;
          const screenX = canvas.width / 2 + rotX * scale;
          const screenY = canvas.height / 2 - rotY * scale;
          const size = BLOCK_SIZE * scale;

          return { screenX, screenY, size, finalZ, block };
        })
        .filter((b) => b !== null)
        .sort((a, b) => b!.finalZ - a!.finalZ);

      visibleBlocks.forEach((item) => {
        if (!item) return;
        const { screenX, screenY, size } = item;

        ctx.fillStyle = "#808080";
        ctx.fillRect(screenX - size / 2, screenY - size / 2, size, size);
        ctx.strokeStyle = "#555555";
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX - size / 2, screenY - size / 2, size, size);
      });

      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 3;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const crosshairSize = 15;
      ctx.beginPath();
      ctx.moveTo(centerX - crosshairSize, centerY);
      ctx.lineTo(centerX + crosshairSize, centerY);
      ctx.moveTo(centerX, centerY - crosshairSize);
      ctx.lineTo(centerX, centerY + crosshairSize);
      ctx.stroke();
    };

    const animationFrame = requestAnimationFrame(function animate() {
      render();
      requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [blocks, playerPos, playerRot]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={() => navigate("/")} variant="outline" size="icon">
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <h1 className="text-3xl font-bold text-green-700">
            ⛏️ Minecraft Обучающий - {Math.floor((300 - playTime) / 60)}:{String((300 - playTime) % 60).padStart(2, "0")}
          </h1>
        </div>

        {showMathQuiz && (
          <Card className="p-8 mb-6 bg-gradient-to-br from-yellow-100 to-orange-100 border-4 border-orange-400">
            <h2 className="text-2xl font-bold text-center mb-6 text-orange-700">⏸️ Математическая пауза!</h2>
            <p className="text-xl text-center mb-6">
              Реши пример, чтобы продолжить игру:
            </p>
            <div className="text-center">
              <p className="text-4xl font-bold mb-6 text-orange-800">
                {mathQuestion.a} × {mathQuestion.b} = ?
              </p>
              <input
                type="number"
                value={mathAnswer}
                onChange={(e) => setMathAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleMathSubmit()}
                className="text-3xl text-center w-40 p-4 border-4 border-orange-400 rounded-lg mb-6"
                autoFocus
                placeholder="?"
              />
              <div>
                <Button onClick={handleMathSubmit} size="lg" className="text-xl px-8 py-6">
                  Проверить ✓
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6 bg-white/90 backdrop-blur">
          <div className="mb-4 text-center space-y-2">
            <p className="text-lg">
              <strong>Управление:</strong> WASD - движение, Пробел - вверх, Shift - вниз
            </p>
            <p className="text-lg">
              <strong>Мышь:</strong> ЛКМ - сломать блок, ПКМ - поставить блок
            </p>
            <p className="text-sm text-gray-600">
              {!isPointerLocked && "🖱️ Кликни на экран для управления камерой"}
            </p>
          </div>

          <canvas
            ref={canvasRef}
            width={1200}
            height={700}
            onClick={handleCanvasClick}
            className="w-full border-4 border-green-500 rounded-lg cursor-crosshair bg-sky-300"
          />

          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Блоков: {blocks.length} | Позиция: X:{playerPos.x.toFixed(1)} Y:{playerPos.y.toFixed(1)} Z:{playerPos.z.toFixed(1)}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MinecraftGame;
