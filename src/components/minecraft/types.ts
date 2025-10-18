export interface Block {
  x: number;
  y: number;
  z: number;
  type: "grass" | "dirt" | "stone" | "cobblestone";
}

export interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
}

export interface TouchControl {
  x: number;
  y: number;
  startX: number;
  startY: number;
  active: boolean;
}

export interface MathQuestion {
  a: number;
  b: number;
}
