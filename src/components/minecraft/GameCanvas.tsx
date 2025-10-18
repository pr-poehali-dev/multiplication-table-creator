import { useEffect, useRef } from "react";
import { Block, Player } from "./types";
import { createTexture } from "./textureUtils";

interface GameCanvasProps {
  blocks: Block[];
  playerPos: { x: number; y: number; z: number };
  playerRot: { yaw: number; pitch: number };
  otherPlayers: Player[];
  isPointerLocked: boolean;
  onPointerLockChange: (locked: boolean) => void;
  onMouseMove: (e: MouseEvent) => void;
  onCanvasClick: () => void;
  isMobile: boolean;
}

const GameCanvas = ({
  blocks,
  playerPos,
  playerRot,
  otherPlayers,
  isPointerLocked,
  onPointerLockChange,
  onMouseMove,
  onCanvasClick,
  isMobile
}: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handlePointerLockChange = () => {
      onPointerLockChange(document.pointerLockElement === canvas);
    };

    document.addEventListener("pointerlockchange", handlePointerLockChange);
    if (!isMobile) {
      document.addEventListener("mousemove", onMouseMove);
    }

    return () => {
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
      if (!isMobile) {
        document.removeEventListener("mousemove", onMouseMove);
      }
    };
  }, [isMobile, onMouseMove, onPointerLockChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const BLOCK_SIZE = 1;

    const render = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      ctx.fillStyle = "#87CEEB";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const fov = 90;
      const aspect = canvas.width / canvas.height;
      const near = 0.1;
      const far = 100;

      const project = (x: number, y: number, z: number) => {
        const dx = x - playerPos.x;
        const dy = y - playerPos.y;
        const dz = z - playerPos.z;

        const cosYaw = Math.cos(playerRot.yaw);
        const sinYaw = Math.sin(playerRot.yaw);
        const cosPitch = Math.cos(playerRot.pitch);
        const sinPitch = Math.sin(playerRot.pitch);

        const x1 = dx * cosYaw - dz * sinYaw;
        const z1 = dx * sinYaw + dz * cosYaw;
        const y1 = dy * cosPitch - z1 * sinPitch;
        const z2 = dy * sinPitch + z1 * cosPitch;

        if (z2 <= near) return null;

        const scale = (canvas.height / 2) / Math.tan((fov / 2) * (Math.PI / 180));
        const sx = canvas.width / 2 + (x1 * scale) / z2;
        const sy = canvas.height / 2 - (y1 * scale) / z2;

        return { x: sx, y: sy, z: z2 };
      };

      const sortedBlocks = [...blocks].sort((a, b) => {
        const distA = Math.hypot(a.x - playerPos.x, a.y - playerPos.y, a.z - playerPos.z);
        const distB = Math.hypot(b.x - playerPos.x, b.y - playerPos.y, b.z - playerPos.z);
        return distB - distA;
      });

      sortedBlocks.forEach((block) => {
        const vertices = [
          { x: block.x, y: block.y, z: block.z },
          { x: block.x + BLOCK_SIZE, y: block.y, z: block.z },
          { x: block.x + BLOCK_SIZE, y: block.y + BLOCK_SIZE, z: block.z },
          { x: block.x, y: block.y + BLOCK_SIZE, z: block.z },
          { x: block.x, y: block.y, z: block.z + BLOCK_SIZE },
          { x: block.x + BLOCK_SIZE, y: block.y, z: block.z + BLOCK_SIZE },
          { x: block.x + BLOCK_SIZE, y: block.y + BLOCK_SIZE, z: block.z + BLOCK_SIZE },
          { x: block.x, y: block.y + BLOCK_SIZE, z: block.z + BLOCK_SIZE },
        ];

        const projected = vertices.map((v) => project(v.x, v.y, v.z)).filter((p) => p !== null);
        if (projected.length < 4) return;

        const faces = [
          { indices: [0, 1, 2, 3], face: 'side' as const },
          { indices: [4, 5, 6, 7], face: 'side' as const },
          { indices: [0, 1, 5, 4], face: 'side' as const },
          { indices: [2, 3, 7, 6], face: 'top' as const },
          { indices: [0, 3, 7, 4], face: 'side' as const },
          { indices: [1, 2, 6, 5], face: 'side' as const },
        ];

        faces.forEach(({ indices, face }) => {
          const faceVertices = indices.map((i) => projected[i]).filter((p) => p !== null);
          if (faceVertices.length < 3) return;

          ctx.beginPath();
          ctx.moveTo(faceVertices[0]!.x, faceVertices[0]!.y);
          faceVertices.forEach((v) => {
            if (v) ctx.lineTo(v.x, v.y);
          });
          ctx.closePath();

          const texture = createTexture(block.type, face);
          const pattern = ctx.createPattern(texture, 'repeat');
          if (pattern) {
            ctx.fillStyle = pattern;
          }
          ctx.fill();
          ctx.strokeStyle = "rgba(0,0,0,0.2)";
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      });

      otherPlayers.forEach((player) => {
        const headPos = project(player.x, player.y + 1.5, player.z);
        if (headPos && headPos.z > 0) {
          ctx.fillStyle = "#FF6B6B";
          ctx.beginPath();
          ctx.arc(headPos.x, headPos.y, 20 / headPos.z, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "14px Arial";
          ctx.textAlign = "center";
          ctx.fillText(player.name, headPos.x, headPos.y - 30 / headPos.z);
        }
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [blocks, playerPos, playerRot, otherPlayers]);

  return (
    <canvas
      ref={canvasRef}
      onClick={onCanvasClick}
      className="w-full h-full cursor-crosshair"
    />
  );
};

export default GameCanvas;
