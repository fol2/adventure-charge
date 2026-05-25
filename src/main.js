import Phaser from 'phaser';
import { AccountScene } from './scenes/AccountScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { GameScene } from './scenes/GameScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { ShopScene } from './scenes/ShopScene.js';
import { gameSettings } from './data/gameSettings.js';
import './styles.css';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: gameSettings.gameWidth,
  height: gameSettings.gameHeight,
  backgroundColor: '#111936',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: [MenuScene, AccountScene, ShopScene, GameScene, GameOverScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
