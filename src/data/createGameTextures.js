import { gameSettings } from './gameSettings.js';

export function createGameTextures(scene) {
  if (scene.textures.exists('player-blue')) {
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

  createShipTexture(graphics, 'player-blue', 0x7dd3fc, 0xdbeafe, 0xf97316);
  createShipTexture(graphics, 'player-ruby', 0xfb7185, 0xffd5df, 0xfacc15);
  createShipTexture(graphics, 'player-mint', 0x34d399, 0xd1fae5, 0x38bdf8);
  createShipTexture(graphics, 'player-gold', 0xfacc15, 0xfef9c3, 0xfb7185);
  createShipTexture(graphics, 'player-neon', 0xa78bfa, 0xf5d0fe, 0x22d3ee);
  createCartTexture(graphics, 'cart-moon', 0x93c5fd, 0xe0f2fe, 0x64748b);
  createCartTexture(graphics, 'cart-comet', 0xfbbf24, 0xffedd5, 0x7c2d12);
  createCartTexture(graphics, 'cart-rocket', 0xf87171, 0xffe4e6, 0x1f2937);
  createCartTexture(graphics, 'cart-star', 0x22c55e, 0xdcfce7, 0x14532d);

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

function createShipTexture(graphics, textureKey, mainColour, windowColour, flameColour) {
  graphics.fillStyle(mainColour, 1);
  graphics.fillTriangle(38, 0, 4, 42, 72, 42);
  graphics.fillStyle(windowColour, 1);
  graphics.fillCircle(38, 24, 10);
  graphics.fillStyle(flameColour, 1);
  graphics.fillTriangle(24, 42, 14, 56, 34, 42);
  graphics.fillTriangle(52, 42, 42, 56, 62, 42);
  graphics.lineStyle(4, 0xffffff, 1);
  graphics.strokeTriangle(38, 0, 4, 42, 72, 42);
  graphics.generateTexture(textureKey, 76, 58);
  graphics.clear();
}

function createCartTexture(graphics, textureKey, bodyColour, topColour, wheelColour) {
  graphics.fillStyle(bodyColour, 1);
  graphics.fillRoundedRect(8, 18, 60, 28, 10);
  graphics.fillStyle(topColour, 1);
  graphics.fillRoundedRect(22, 6, 30, 22, 8);
  graphics.fillStyle(wheelColour, 1);
  graphics.fillCircle(20, 48, 8);
  graphics.fillCircle(56, 48, 8);
  graphics.fillStyle(0xf97316, 1);
  graphics.fillTriangle(30, 46, 20, 58, 40, 46);
  graphics.fillTriangle(50, 46, 40, 58, 60, 46);
  graphics.lineStyle(4, 0xffffff, 1);
  graphics.strokeRoundedRect(8, 18, 60, 28, 10);
  graphics.generateTexture(textureKey, 76, 58);
  graphics.clear();
}
