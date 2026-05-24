import Phaser from 'phaser';
import { playStartSound } from '../audio/soundEffects.js';
import { createGameTextures } from '../data/createGameTextures.js';
import { gameSettings } from '../data/gameSettings.js';
import { setSmokeStateReader } from '../data/smokeMode.js';
import { createTextButton } from '../ui/textButton.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data) {
    createGameTextures(this);
    const centreX = gameSettings.gameWidth / 2;
    const centreY = gameSettings.gameHeight / 2;

    this.add.image(centreX, centreY, 'spaceBackground');

    setSmokeStateReader(() => ({
      scene: 'GameOverScene',
      score: data.score ?? 0
    }));

    this.add.text(centreX, gameSettings.gameOverTitleY, 'Game Over', {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '54px',
      color: '#fecaca',
      stroke: '#172554',
      strokeThickness: 8
    }).setOrigin(0.5);

    this.add.text(centreX, gameSettings.gameOverScoreY, `Score: ${data.score ?? 0}`, {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    createTextButton(this, centreX, gameSettings.gameOverRestartButtonY, 'Restart', () => {
      playStartSound();
      this.scene.start('GameScene');
    });
  }
}
