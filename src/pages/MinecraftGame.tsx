import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

interface Block {
  x: number;
  y: number;
  z: number;
  type: "grass" | "dirt" | "stone" | "cobblestone";
}

interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
}

interface TouchControl {
  x: number;
  y: number;
  startX: number;
  startY: number;
  active: boolean;
}

const MinecraftGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 2.7, z: 8 });
  const [playerRot, setPlayerRot] = useState({ yaw: 0, pitch: 0 });
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [playTime, setPlayTime] = useState(0);
  const [showMathQuiz, setShowMathQuiz] = useState(false);
  const [mathQuestion, setMathQuestion] = useState({ a: 0, b: 0 });
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
  }, []);

  const createTexture = (type: Block["type"], face: 'top' | 'side' | 'bottom') => {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    if (type === "grass") {
      if (face === "top") {
        ctx.fillStyle = "#5DA847";
        ctx.fillRect(0, 0, 16, 16);
        for (let i = 0; i < 40; i++) {
          ctx.fillStyle = Math.random() > 0.5 ? "#4A9C3A" : "#6FB857";
          ctx.fillRect(Math.random() * 16, Math.random() * 16, 1, 1);
        }
      } else {
        ctx.fillStyle = "#8B6914";
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = "#5DA847";
        ctx.fillRect(0, 0, 16, 2);
      }
    } else if (type === "dirt") {
      ctx.fillStyle = "#8B6914";
      ctx.fillRect(0, 0, 16, 16);
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? "#6B4E0A" : "#AB8520";
        ctx.fillRect(Math.random() * 16, Math.random() * 16, 2, 2);
      }
    } else if (type === "stone") {
      ctx.fillStyle = "#7A7A7A";
      ctx.fillRect(0, 0, 16, 16);
      for (let i = 0; i < 50; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? "#5A5A5A" : "#9A9A9A";
        ctx.fillRect(Math.random() * 16, Math.random() * 16, 1, 1);
      }
    } else if (type === "cobblestone") {
      ctx.fillStyle = "#808080";
      ctx.fillRect(0, 0, 16, 16);
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? "#606060" : "#A0A0A0";
        const x = Math.random() * 12;
        const y = Math.random() * 12;
        ctx.fillRect(x, y, 3, 3);
      }
      ctx.strokeStyle = "#404040";
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        ctx.strokeRect(Math.random() * 12, Math.random() * 12, 3, 3);
      }
    }
    
    return canvas;
  };

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
    }, 200);
  };

  const syncPosition = async () => {
    if (!isOnline || !myPlayerId) return;
    
    try {
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
      });
      
      if (response.ok) {
        const data = await response.json();
        setOtherPlayers(data.players.filter((p: Player) => p.id !== myPlayerId));
      }
    } catch (error) {
      console.error("Ошибка синхронизации:", error);
    }
  };

  const syncBlock = async (block: Block, action: "add" | "remove") => {
    if (!isOnline) return;
    
    try {
      await fetch("https://functions.poehali.dev/9efa54f8-c221-4210-b84c-430ee21c3978", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "block",
          roomCode,
          blockAction: action,
          block,
        }),
      });
    } catch (error) {
      console.error("Ошибка синхронизации блока:", error);
    }
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
      if (e.key >= "1" && e.key <= "4") {
        const types: Block["type"][] = ["cobblestone", "grass", "dirt", "stone"];
        setSelectedBlock(types[parseInt(e.key) - 1]);
      }
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

    const speed = 0.1;
    const interval = setInterval(() => {
      setPlayerPos((prev) => {
        let newX = prev.x;
        let newZ = prev.z;
        let newY = prev.y;

        if (isMobile && leftJoystick.active) {
          const angle = Math.atan2(leftJoystick.y - leftJoystick.startY, leftJoystick.x - leftJoystick.startX);
          const distance = Math.min(Math.sqrt(Math.pow(leftJoystick.x - leftJoystick.startX, 2) + Math.pow(leftJoystick.y - leftJoystick.startY, 2)), 50) / 50;
          
          newX += Math.cos(angle + playerRot.yaw) * speed * distance;
          newZ += Math.sin(angle + playerRot.yaw) * speed * distance;
        }

        if (!isMobile || !isPointerLocked) {
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
        }

        return { x: newX, y: newY, z: newZ };
      });
    }, 16);

    return () => clearInterval(interval);
  }, [keys, playerRot, isPaused, isMobile, leftJoystick, isPointerLocked]);

  useEffect(() => {
    if (!isMobile && rightJoystick.active) {
      const deltaX = (rightJoystick.x - rightJoystick.startX) * 0.01;
      const deltaY = (rightJoystick.y - rightJoystick.startY) * 0.01;
      
      setPlayerRot((prev) => ({
        yaw: prev.yaw + deltaX,
        pitch: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, prev.pitch - deltaY)),
      }));
    }
  }, [rightJoystick, isMobile]);

  const handleCanvasClick = () => {
    if (isMobile) return;
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
    if (!isPointerLocked || isPaused || isMobile) return;

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
          syncBlock(hitBlock, "remove");
        }
      } else if (e.button === 2) {
        e.preventDefault();
        const placePos = raycast(false);
        if (placePos) {
          const newBlock = { ...placePos, type: selectedBlock };
          setBlocks((prev) => [...prev, newBlock]);
          syncBlock(newBlock, "add");
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
  }, [isPointerLocked, blocks, playerPos, playerRot, isPaused, isMobile, selectedBlock]);

  const handleMobileBreak = () => {
    const hitBlock = raycast(true);
    if (hitBlock) {
      setBlocks((prev) => prev.filter((b) => !(b.x === hitBlock.x && b.y === hitBlock.y && b.z === hitBlock.z)));
      syncBlock(hitBlock, "remove");
    }
  };

  const handleMobilePlace = () => {
    const placePos = raycast(false);
    if (placePos) {
      const newBlock = { ...placePos, type: selectedBlock };
      setBlocks((prev) => [...prev, newBlock]);
      syncBlock(newBlock, "add");
    }
  };

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
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#6BB6FF");
      gradient.addColorStop(0.5, "#87CEEB");
      gradient.addColorStop(1, "#B0D9F5");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const sunX = canvas.width * 0.8;
      const sunY = canvas.height * 0.15;
      const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 60);
      sunGradient.addColorStop(0, "#FFFFA0");
      sunGradient.addColorStop(0.5, "#FFFF80");
      sunGradient.addColorStop(1, "rgba(255, 255, 160, 0)");
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 60, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 8; i++) {
        const cloudX = ((canvas.width / 8) * i + (Date.now() / 100)) % canvas.width;
        const cloudY = canvas.height * 0.2 + Math.sin(i) * 30;
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.beginPath();
        ctx.arc(cloudX, cloudY, 30, 0, Math.PI * 2);
        ctx.arc(cloudX + 25, cloudY, 35, 0, Math.PI * 2);
        ctx.arc(cloudX + 50, cloudY, 30, 0, Math.PI * 2);
        ctx.fill();
      }

      const allBlocks = [...blocks];
      
      otherPlayers.forEach((player) => {
        allBlocks.push({
          x: Math.floor(player.x),
          y: Math.floor(player.y + 0.5),
          z: Math.floor(player.z),
          type: "stone"
        });
      });

      const visibleFaces = allBlocks.flatMap((block) => {
        const dx = block.x + 0.5 - playerPos.x;
        const dy = block.y + 0.5 - playerPos.y;
        const dz = block.z + 0.5 - playerPos.z;

        const rotX = dx * Math.cos(playerRot.yaw) - dz * Math.sin(playerRot.yaw);
        const rotZ = dx * Math.sin(playerRot.yaw) + dz * Math.cos(playerRot.yaw);
        const rotY = dy * Math.cos(playerRot.pitch) - rotZ * Math.sin(playerRot.pitch);
        const finalZ = dy * Math.sin(playerRot.pitch) + rotZ * Math.cos(playerRot.pitch);

        if (finalZ <= 0.1) return [];

        const scale = 400 / finalZ;
        const centerX = canvas.width / 2 + rotX * scale;
        const centerY = canvas.height / 2 - rotY * scale;
        const size = BLOCK_SIZE * scale;

        const isPlayerBlock = otherPlayers.some(p => 
          Math.floor(p.x) === block.x && 
          Math.floor(p.y + 0.5) === block.y && 
          Math.floor(p.z) === block.z
        );

        const faces = [];
        
        const hasBlockAbove = allBlocks.some(b => b.x === block.x && b.y === block.y + 1 && b.z === block.z);
        const hasBlockBelow = allBlocks.some(b => b.x === block.x && b.y === block.y - 1 && b.z === block.z);
        const hasBlockFront = allBlocks.some(b => b.x === block.x && b.y === block.y && b.z === block.z - 1);
        const hasBlockBack = allBlocks.some(b => b.x === block.x && b.y === block.y && b.z === block.z + 1);
        const hasBlockLeft = allBlocks.some(b => b.x === block.x - 1 && b.y === block.y && b.z === block.z);
        const hasBlockRight = allBlocks.some(b => b.x === block.x + 1 && b.y === block.y && b.z === block.z);

        const faceSize = size * 0.5;
        
        if (!hasBlockAbove && rotY < 0) {
          faces.push({
            type: 'top',
            z: finalZ,
            points: [
              { x: centerX - faceSize, y: centerY - faceSize },
              { x: centerX + faceSize, y: centerY - faceSize },
              { x: centerX + faceSize, y: centerY },
              { x: centerX - faceSize, y: centerY }
            ],
            brightness: 1,
            blockType: block.type,
            isPlayer: isPlayerBlock,
            face: 'top' as const
          });
        }
        
        if (!hasBlockBelow && rotY > 0) {
          faces.push({
            type: 'bottom',
            z: finalZ,
            points: [
              { x: centerX - faceSize, y: centerY },
              { x: centerX + faceSize, y: centerY },
              { x: centerX + faceSize, y: centerY + faceSize },
              { x: centerX - faceSize, y: centerY + faceSize }
            ],
            brightness: 0.5,
            blockType: block.type,
            isPlayer: isPlayerBlock,
            face: 'bottom' as const
          });
        }
        
        if (!hasBlockFront && rotZ > 0) {
          faces.push({
            type: 'front',
            z: finalZ,
            points: [
              { x: centerX - faceSize, y: centerY - faceSize },
              { x: centerX + faceSize, y: centerY - faceSize },
              { x: centerX + faceSize, y: centerY + faceSize },
              { x: centerX - faceSize, y: centerY + faceSize }
            ],
            brightness: 0.8,
            blockType: block.type,
            isPlayer: isPlayerBlock,
            face: 'side' as const
          });
        }
        
        if (!hasBlockBack && rotZ < 0) {
          faces.push({
            type: 'back',
            z: finalZ,
            points: [
              { x: centerX - faceSize, y: centerY - faceSize },
              { x: centerX + faceSize, y: centerY - faceSize },
              { x: centerX + faceSize, y: centerY + faceSize },
              { x: centerX - faceSize, y: centerY + faceSize }
            ],
            brightness: 0.6,
            blockType: block.type,
            isPlayer: isPlayerBlock,
            face: 'side' as const
          });
        }
        
        if (!hasBlockLeft && rotX < 0) {
          faces.push({
            type: 'left',
            z: finalZ,
            points: [
              { x: centerX - faceSize, y: centerY - faceSize },
              { x: centerX, y: centerY - faceSize * 0.7 },
              { x: centerX, y: centerY + faceSize * 0.7 },
              { x: centerX - faceSize, y: centerY + faceSize }
            ],
            brightness: 0.7,
            blockType: block.type,
            isPlayer: isPlayerBlock,
            face: 'side' as const
          });
        }
        
        if (!hasBlockRight && rotX > 0) {
          faces.push({
            type: 'right',
            z: finalZ,
            points: [
              { x: centerX, y: centerY - faceSize * 0.7 },
              { x: centerX + faceSize, y: centerY - faceSize },
              { x: centerX + faceSize, y: centerY + faceSize },
              { x: centerX, y: centerY + faceSize * 0.7 }
            ],
            brightness: 0.7,
            blockType: block.type,
            isPlayer: isPlayerBlock,
            face: 'side' as const
          });
        }

        return faces;
      });

      visibleFaces.sort((a, b) => b.z - a.z);

      visibleFaces.forEach((face) => {
        const texture = createTexture(face.blockType, face.face);
        
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(face.points[0].x, face.points[0].y);
        face.points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.clip();

        const pattern = ctx.createPattern(texture, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fill();
        }
        
        if (face.isPlayer) {
          ctx.fillStyle = `rgba(255, 100, 100, ${0.5 * face.brightness})`;
        } else {
          ctx.fillStyle = `rgba(0, 0, 0, ${(1 - face.brightness) * 0.4})`;
        }
        ctx.fill();

        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
      });

      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 3;
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 4;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const crosshairSize = 15;
      ctx.beginPath();
      ctx.moveTo(centerX - crosshairSize, centerY);
      ctx.lineTo(centerX + crosshairSize, centerY);
      ctx.moveTo(centerX, centerY - crosshairSize);
      ctx.lineTo(centerX, centerY + crosshairSize);
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const animationFrame = requestAnimationFrame(function animate() {
      render();
      requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [blocks, playerPos, playerRot, otherPlayers]);

  const handleTouchStart = (e: React.TouchEvent, isLeft: boolean) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    if (isLeft) {
      setLeftJoystick({ x, y, startX: x, startY: y, active: true });
    } else {
      setRightJoystick({ x, y, startX: x, startY: y, active: true });
    }
  };

  const handleTouchMove = (e: React.TouchEvent, isLeft: boolean) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    if (isLeft) {
      setLeftJoystick((prev) => ({ ...prev, x, y }));
    } else {
      setRightJoystick((prev) => {
        const deltaX = (x - prev.startX) * 0.01;
        const deltaY = (y - prev.startY) * 0.01;
        
        setPlayerRot((rot) => ({
          yaw: rot.yaw + deltaX,
          pitch: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rot.pitch - deltaY)),
        }));
        
        return { ...prev, x: prev.startX, y: prev.startY };
      });
    }
  };

  const handleTouchEnd = (isLeft: boolean) => {
    if (isLeft) {
      setLeftJoystick({ x: 0, y: 0, startX: 0, startY: 0, active: false });
    } else {
      setRightJoystick({ x: 0, y: 0, startX: 0, startY: 0, active: false });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 p-2 md:p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-6 flex-wrap">
          <Button onClick={() => navigate("/")} variant="outline" size="icon">
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <h1 className="text-xl md:text-3xl font-bold text-green-700">
            ⛏️ Minecraft {isOnline && `[${roomCode}]`} - {Math.floor((300 - playTime) / 60)}:{String((300 - playTime) % 60).padStart(2, "0")}
          </h1>
          <Button 
            onClick={() => setShowJoinRoom(true)} 
            variant={isOnline ? "default" : "outline"}
            size="sm"
            className="ml-auto"
          >
            <Icon name="Users" size={16} />
            {isOnline ? `Онлайн (${otherPlayers.length + 1})` : "Играть онлайн"}
          </Button>
        </div>

        {showJoinRoom && (
          <Card className="p-6 mb-4 bg-white/90 backdrop-blur">
            <h2 className="text-2xl font-bold mb-4 text-center">🌐 Онлайн режим</h2>
            <div className="space-y-4">
              <Input
                placeholder="Твоё имя"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="text-lg"
              />
              <div className="flex gap-4">
                <Button onClick={createRoom} className="flex-1" size="lg">
                  <Icon name="Plus" size={20} />
                  Создать комнату
                </Button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">или</span>
                </div>
              </div>
              <Input
                placeholder="Код комнаты"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="text-lg uppercase"
                maxLength={6}
              />
              <Button onClick={joinRoom} className="w-full" size="lg" variant="outline">
                <Icon name="LogIn" size={20} />
                Войти в комнату
              </Button>
              <Button onClick={() => setShowJoinRoom(false)} variant="ghost" className="w-full">
                Отмена
              </Button>
            </div>
          </Card>
        )}

        {showMathQuiz && (
          <Card className="p-6 md:p-8 mb-4 md:mb-6 bg-gradient-to-br from-yellow-100 to-orange-100 border-4 border-orange-400">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6 text-orange-700">⏸️ Математическая пауза!</h2>
            <p className="text-lg md:text-xl text-center mb-4 md:mb-6">
              Реши пример, чтобы продолжить игру:
            </p>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-orange-800">
                {mathQuestion.a} × {mathQuestion.b} = ?
              </p>
              <input
                type="number"
                value={mathAnswer}
                onChange={(e) => setMathAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleMathSubmit()}
                className="text-2xl md:text-3xl text-center w-32 md:w-40 p-3 md:p-4 border-4 border-orange-400 rounded-lg mb-4 md:mb-6"
                autoFocus
                placeholder="?"
              />
              <div>
                <Button onClick={handleMathSubmit} size="lg" className="text-lg md:text-xl px-6 md:px-8 py-4 md:py-6">
                  Проверить ✓
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-4 md:p-6 bg-white/90 backdrop-blur">
          {!isMobile && (
            <div className="mb-4 text-center space-y-2">
              <p className="text-sm md:text-lg">
                <strong>Управление:</strong> WASD - движение, Мышь - камера, Пробел/Shift - вверх/вниз
              </p>
              <p className="text-sm md:text-lg">
                <strong>Блоки:</strong> 1-Булыжник 2-Трава 3-Земля 4-Камень | ЛКМ - сломать, ПКМ - поставить
              </p>
              <div className="flex justify-center gap-2 flex-wrap">
                {(["cobblestone", "grass", "dirt", "stone"] as const).map((type, i) => (
                  <Button
                    key={type}
                    onClick={() => setSelectedBlock(type)}
                    variant={selectedBlock === type ? "default" : "outline"}
                    size="sm"
                    className="gap-1"
                  >
                    {i + 1} - {type === "cobblestone" ? "Булыжник" : type === "grass" ? "Трава" : type === "dirt" ? "Земля" : "Камень"}
                  </Button>
                ))}
              </div>
              <p className="text-xs md:text-sm text-gray-600">
                {!isPointerLocked && "🖱️ Кликни на экран для управления камерой"}
              </p>
            </div>
          )}

          <div className="relative">
            <canvas
              ref={canvasRef}
              width={isMobile ? 800 : 1200}
              height={isMobile ? 600 : 700}
              onClick={handleCanvasClick}
              className="w-full border-2 md:border-4 border-green-500 rounded-lg cursor-crosshair"
            />
            
            {isMobile && (
              <>
                <div 
                  className="absolute bottom-4 left-4 w-32 h-32 bg-gray-800/50 rounded-full border-4 border-white"
                  onTouchStart={(e) => handleTouchStart(e, true)}
                  onTouchMove={(e) => handleTouchMove(e, true)}
                  onTouchEnd={() => handleTouchEnd(true)}
                >
                  {leftJoystick.active && (
                    <div 
                      className="absolute w-12 h-12 bg-white rounded-full"
                      style={{
                        left: leftJoystick.x - leftJoystick.startX + 40,
                        top: leftJoystick.y - leftJoystick.startY + 40,
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
                    MOVE
                  </div>
                </div>

                <div 
                  className="absolute bottom-4 right-4 w-32 h-32 bg-gray-800/50 rounded-full border-4 border-white"
                  onTouchStart={(e) => handleTouchStart(e, false)}
                  onTouchMove={(e) => handleTouchMove(e, false)}
                  onTouchEnd={() => handleTouchEnd(false)}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
                    LOOK
                  </div>
                </div>

                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Button onClick={handleMobileBreak} size="lg" variant="destructive" className="w-16 h-16">
                    <Icon name="Hammer" size={24} />
                  </Button>
                  <Button onClick={handleMobilePlace} size="lg" className="w-16 h-16">
                    <Icon name="Plus" size={24} />
                  </Button>
                  <Button onClick={() => setPlayerPos(p => ({...p, y: p.y + 0.5}))} size="lg" variant="outline" className="w-16 h-16">
                    ↑
                  </Button>
                  <Button onClick={() => setPlayerPos(p => ({...p, y: p.y - 0.5}))} size="lg" variant="outline" className="w-16 h-16">
                    ↓
                  </Button>
                </div>

                <div className="absolute top-4 left-4 flex gap-1">
                  {(["cobblestone", "grass", "dirt", "stone"] as const).map((type) => (
                    <Button
                      key={type}
                      onClick={() => setSelectedBlock(type)}
                      variant={selectedBlock === type ? "default" : "outline"}
                      size="sm"
                      className="w-12 h-12 p-1 text-xs"
                    >
                      {type[0].toUpperCase()}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="mt-4 text-center text-xs md:text-sm text-gray-600">
            <p>Блоков: {blocks.length} | Позиция: X:{playerPos.x.toFixed(1)} Y:{playerPos.y.toFixed(1)} Z:{playerPos.z.toFixed(1)}</p>
            {isOnline && <p className="text-green-600 font-bold">🌐 Онлайн игроков: {otherPlayers.length + 1}</p>}
            <p className="text-blue-600 font-bold">📦 Выбранный блок: {selectedBlock === "cobblestone" ? "Булыжник" : selectedBlock === "grass" ? "Трава" : selectedBlock === "dirt" ? "Земля" : "Камень"}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MinecraftGame;
