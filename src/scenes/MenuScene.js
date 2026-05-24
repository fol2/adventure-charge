import Phaser from 'phaser';
import { playStartSound } from '../audio/soundEffects.js';
import { createGameTextures } from '../data/createGameTextures.js';
import { gameSettings } from '../data/gameSettings.js';
import { createTextButton } from '../ui/textButton.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    createGameTextures(this);
    const centreX = gameSettings.gameWidth / 2;
    const centreY = gameSettings.gameHeight / 2;

    this.add.image(centreX, centreY, 'spaceBackground');

    this.add.text(centreX, gameSettings.menuTitleY, 'Star Dash', {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '64px',
      color: '#fef3c7',
      stroke: '#172554',
      strokeThickness: 8
    }).setOrigin(0.5);

    this.add.image(centreX, gameSettings.menuPlayerY, 'player').setScale(1.15);

    createTextButton(this, centreX, gameSettings.menuStartButtonY, 'Start', () => {
      playStartSound();
      this.scene.start('GameScene');
    });

    this.cameras.main.setBounds(0, 0, gameSettings.gameWidth, gameSettings.gameHeight);
  }
}
