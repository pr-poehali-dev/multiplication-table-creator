import { Block } from "./types";

const textureCache = new Map<string, HTMLCanvasElement>();

export const createTexture = (type: Block["type"], face: 'top' | 'side' | 'bottom') => {
  const cacheKey = `${type}_${face}`;
  
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }
  
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
  
  textureCache.set(cacheKey, canvas);
  return canvas;
};