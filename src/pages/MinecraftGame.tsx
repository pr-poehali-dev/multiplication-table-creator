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
  type: "cobblestone" | "grass" | "dirt" | "stone";
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
  const glRef = useRef<WebGLRenderingContext | null>(null);
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
        if (Math.random() > 0.7) {
          const height = Math.floor(Math.random() * 3) + 1;
          for (let h = 1; h <= height; h++) {
            groundBlocks.push({ x, y: h, z, type: "dirt" });
          }
        }
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

    const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }
    glRef.current = gl;

    const vertexShaderSource = `
      attribute vec3 position;
      attribute vec3 normal;
      attribute vec3 color;
      
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      
      varying vec3 vColor;
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vColor = color;
        vNormal = normal;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      
      varying vec3 vColor;
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
        float diffuse = max(dot(vNormal, lightDir), 0.3);
        
        float fog = 1.0 - clamp(length(vPosition) / 30.0, 0.0, 0.7);
        vec3 finalColor = vColor * diffuse * fog + vec3(0.7, 0.85, 1.0) * (1.0 - fog);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, "position");
    const normalLocation = gl.getAttribLocation(program, "normal");
    const colorLocation = gl.getAttribLocation(program, "color");
    const modelViewMatrixLocation = gl.getUniformLocation(program, "modelViewMatrix");
    const projectionMatrixLocation = gl.getUniformLocation(program, "projectionMatrix");

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    const getBlockColor = (type: Block["type"], face: string): [number, number, number] => {
      const colors = {
        grass: { top: [0.4, 0.8, 0.2], side: [0.5, 0.6, 0.3], bottom: [0.4, 0.3, 0.2] },
        dirt: { top: [0.5, 0.35, 0.2], side: [0.5, 0.35, 0.2], bottom: [0.5, 0.35, 0.2] },
        stone: { top: [0.5, 0.5, 0.5], side: [0.5, 0.5, 0.5], bottom: [0.5, 0.5, 0.5] },
        cobblestone: { top: [0.6, 0.6, 0.6], side: [0.6, 0.6, 0.6], bottom: [0.6, 0.6, 0.6] },
      };
      return colors[type][face as keyof typeof colors.grass] as [number, number, number];
    };

    const createCubeMesh = (block: Block) => {
      const { x, y, z, type } = block;
      const vertices: number[] = [];
      const normals: number[] = [];
      const colors: number[] = [];

      const faces = [
        { pos: [[0,1,1], [1,1,1], [1,1,0], [0,1,0]], normal: [0,1,0], name: "top" },
        { pos: [[0,0,0], [1,0,0], [1,0,1], [0,0,1]], normal: [0,-1,0], name: "bottom" },
        { pos: [[0,0,1], [1,0,1], [1,1,1], [0,1,1]], normal: [0,0,1], name: "side" },
        { pos: [[1,0,0], [0,0,0], [0,1,0], [1,1,0]], normal: [0,0,-1], name: "side" },
        { pos: [[1,0,1], [1,0,0], [1,1,0], [1,1,1]], normal: [1,0,0], name: "side" },
        { pos: [[0,0,0], [0,0,1], [0,1,1], [0,1,0]], normal: [-1,0,0], name: "side" },
      ];

      faces.forEach(face => {
        const [p1, p2, p3, p4] = face.pos;
        const color = getBlockColor(type, face.name);
        
        [p1, p2, p3, p1, p3, p4].forEach(p => {
          vertices.push(x + p[0] - 0.5, y + p[1] - 0.5, z + p[2] - 0.5);
          normals.push(...face.normal);
          colors.push(...color);
        });
      });

      return { vertices, normals, colors };
    };

    const render = () => {
      gl.clearColor(0.53, 0.81, 0.92, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      const fov = 75 * Math.PI / 180;
      const aspect = canvas.width / canvas.height;
      const near = 0.1;
      const far = 100;
      const f = 1.0 / Math.tan(fov / 2);

      const projectionMatrix = new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) / (near - far), -1,
        0, 0, (2 * far * near) / (near - far), 0
      ]);

      const cam = {
        x: playerPos.x,
        y: playerPos.y,
        z: playerPos.z
      };

      const viewMatrix = new Float32Array(16);
      const sy = Math.sin(playerRot.yaw);
      const cy = Math.cos(playerRot.yaw);
      const sp = Math.sin(playerRot.pitch);
      const cp = Math.cos(playerRot.pitch);

      viewMatrix[0] = cy; viewMatrix[1] = sy * sp; viewMatrix[2] = sy * cp; viewMatrix[3] = 0;
      viewMatrix[4] = 0; viewMatrix[5] = cp; viewMatrix[6] = -sp; viewMatrix[7] = 0;
      viewMatrix[8] = -sy; viewMatrix[9] = cy * sp; viewMatrix[10] = cy * cp; viewMatrix[11] = 0;
      viewMatrix[12] = cam.x * cy - cam.z * sy;
      viewMatrix[13] = cam.x * sy * sp + cam.y * cp - cam.z * cy * sp;
      viewMatrix[14] = cam.x * sy * cp - cam.y * sp - cam.z * cy * cp;
      viewMatrix[15] = 1;

      gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
      gl.uniformMatrix4fv(modelViewMatrixLocation, false, viewMatrix);

      const visibleBlocks = [...blocks];
      
      otherPlayers.forEach((player) => {
        visibleBlocks.push({
          x: Math.floor(player.x),
          y: Math.floor(player.y),
          z: Math.floor(player.z),
          type: "stone"
        });
        visibleBlocks.push({
          x: Math.floor(player.x),
          y: Math.floor(player.y) + 1,
          z: Math.floor(player.z),
          type: "stone"
        });
      });

      visibleBlocks.forEach(block => {
        const mesh = createCubeMesh(block);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLocation);

        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.normals), gl.STATIC_DRAW);
        gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(normalLocation);

        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.colors), gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorLocation);

        gl.drawArrays(gl.TRIANGLES, 0, mesh.vertices.length / 3);
      });

      requestAnimationFrame(render);
    };

    render();

    return () => {
      if (gl) {
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
    };
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
            <p className="text-blue-600 font-bold">Выбранный блок: {selectedBlock === "cobblestone" ? "Булыжник" : selectedBlock === "grass" ? "Трава" : selectedBlock === "dirt" ? "Земля" : "Камень"}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MinecraftGame;
