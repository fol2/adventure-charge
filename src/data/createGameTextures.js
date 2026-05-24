import { gameSettings } from './gameSettings.js';

export function createGameTextures(scene) {
  if (scene.textures.exists('player')) {
    return;
  }

  const graphics = scene.make.graphics({ add: false });
  const width = gameSettings.gameWidth;
  const height = gameSettings.gameHeight;

  graphics.fillStyle(0x111936, 1);
  graphics.fillRect(0, 0, width, height);
  graphics.fillStyle(0xffffff, 0.55);
  [
    [0.1, 0.15, 2],
    [0.2, 0.37, 1],
    [0.35, 0.2, 2],
    [0.49, 0.52, 1],
    [0.65, 0.3, 2],
    [0.83, 0.13, 1],
    [0.91, 0.43, 2],
    [0.14, 0.7, 1],
    [0.56, 0.8, 2],
    [0.88, 0.87, 1]
  ].forEach(([xRatio, yRatio, radius]) => {
    graphics.fillCircle(width * xRatio, height * yRatio, radius);
  });
  graphics.generateTexture('spaceBackground', width, height);
  graphics.clear();

  graphics.fillStyle(0x7dd3fc, 1);
  graphics.fillTriangle(38, 0, 4, 42, 72, 42);
  graphics.fillStyle(0xdbeafe, 1);
  graphics.fillCircle(38, 24, 10);
  graphics.fillStyle(0xf97316, 1);
  graphics.fillTriangle(24, 42, 14, 56, 34, 42);
  graphics.fillTriangle(52, 42, 42, 56, 62, 42);
  graphics.lineStyle(4, 0xffffff, 1);
  graphics.strokeTriangle(38, 0, 4, 42, 72, 42);
  graphics.generateTexture('player', 76, 58);
  graphics.clear();

  graphics.fillStyle(0xfacc15, 1);
  graphics.fillCircle(18, 18, 13);
  graphics.fillStyle(0xfef3c7, 1);
  graphics.fillTriangle(18, 0, 22, 14, 14, 14);
  graphics.fillTriangle(18, 36, 22, 22, 14, 22);
  graphics.fillTriangle(0, 18, 14, 14, 14, 22);
  graphics.fillTriangle(36, 18, 22, 14, 22, 22);
  graphics.lineStyle(3, 0xffffff, 0.9);
  graphics.strokeCircle(18, 18, 13);
  graphics.generateTexture('star', 36, 36);
  graphics.clear();

  graphics.fillStyle(0x9ca3af, 1);
  graphics.fillCircle(22, 22, 20);
  graphics.fillStyle(0x6b7280, 1);
  graphics.fillCircle(14, 14, 5);
  graphics.fillCircle(27, 24, 6);
  graphics.fillStyle(0xd1d5db, 1);
  graphics.fillCircle(28, 11, 4);
  graphics.lineStyle(3, 0xffffff, 0.85);
  graphics.strokeCircle(22, 22, 20);
  graphics.generateTexture('rock', 44, 44);
  graphics.destroy();
}
