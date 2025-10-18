import { TouchControl } from "./types";

interface MobileControlsProps {
  leftJoystick: TouchControl;
  rightJoystick: TouchControl;
  onLeftTouchStart: (e: React.TouchEvent) => void;
  onLeftTouchMove: (e: React.TouchEvent) => void;
  onLeftTouchEnd: () => void;
  onRightTouchStart: (e: React.TouchEvent) => void;
  onRightTouchMove: (e: React.TouchEvent) => void;
  onRightTouchEnd: () => void;
  onJump: () => void;
  onPlace: () => void;
  onBreak: () => void;
}

const MobileControls = ({
  leftJoystick,
  rightJoystick,
  onLeftTouchStart,
  onLeftTouchMove,
  onLeftTouchEnd,
  onRightTouchStart,
  onRightTouchMove,
  onRightTouchEnd,
  onJump,
  onPlace,
  onBreak
}: MobileControlsProps) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <div
        className="absolute bottom-24 left-8 w-32 h-32 bg-gray-800/50 rounded-full pointer-events-auto"
        onTouchStart={onLeftTouchStart}
        onTouchMove={onLeftTouchMove}
        onTouchEnd={onLeftTouchEnd}
      >
        <div
          className="absolute w-12 h-12 bg-blue-500 rounded-full transition-all"
          style={{
            left: `${leftJoystick.active ? leftJoystick.x : 40}px`,
            top: `${leftJoystick.active ? leftJoystick.y : 40}px`,
          }}
        />
      </div>

      <div
        className="absolute bottom-24 right-8 w-32 h-32 bg-gray-800/50 rounded-full pointer-events-auto"
        onTouchStart={onRightTouchStart}
        onTouchMove={onRightTouchMove}
        onTouchEnd={onRightTouchEnd}
      >
        <div
          className="absolute w-12 h-12 bg-red-500 rounded-full transition-all"
          style={{
            left: `${rightJoystick.active ? rightJoystick.x : 40}px`,
            top: `${rightJoystick.active ? rightJoystick.y : 40}px`,
          }}
        />
      </div>

      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex gap-4 pointer-events-auto">
        <button
          onTouchStart={onJump}
          className="w-16 h-16 bg-green-500 rounded-full text-white font-bold text-xl"
        >
          ↑
        </button>
        <button
          onTouchStart={onPlace}
          className="w-16 h-16 bg-yellow-500 rounded-full text-white font-bold text-xl"
        >
          +
        </button>
        <button
          onTouchStart={onBreak}
          className="w-16 h-16 bg-red-500 rounded-full text-white font-bold text-xl"
        >
          −
        </button>
      </div>
    </div>
  );
};

export default MobileControls;
