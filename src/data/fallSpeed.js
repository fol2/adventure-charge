import { gameSettings } from './gameSettings.js';

export function calculateFallSpeed(score) {
  const speedSteps = Math.floor(score / gameSettings.speedIncreaseEveryPoints);
  const speed = gameSettings.startingFallSpeed + speedSteps * gameSettings.speedIncreaseAmount;

  return Math.min(speed, gameSettings.maxFallSpeed);
}
