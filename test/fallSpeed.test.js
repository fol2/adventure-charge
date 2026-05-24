import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFallSpeed } from '../src/data/fallSpeed.js';
import { gameSettings } from '../src/data/gameSettings.js';

test('calculateFallSpeed starts with the beginner-friendly starting speed', () => {
  assert.equal(calculateFallSpeed(0), gameSettings.startingFallSpeed);
});

test('calculateFallSpeed increases as the score grows', () => {
  assert.equal(
    calculateFallSpeed(gameSettings.speedIncreaseEveryPoints),
    gameSettings.startingFallSpeed + gameSettings.speedIncreaseAmount
  );
});

test('calculateFallSpeed never goes above the maximum speed', () => {
  assert.equal(calculateFallSpeed(9999), gameSettings.maxFallSpeed);
});
