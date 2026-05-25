import Phaser from 'phaser';
import { playCollectSound, playHitSound } from '../audio/soundEffects.js';
import { createGameTextures } from '../data/createGameTextures.js';
import { calculateFallSpeed } from '../data/fallSpeed.js';
import { gameSettings } from '../data/gameSettings.js';
import { setSmokeStateReader } from '../data/smokeMode.js';
import { finishRound, loadShopState } from '../data/shopState.js';
import { findShopItem } from '../data/shopItems.js';
import { FallingItem } from '../objects/FallingItem.js';
import { Player } from '../objects/Player.js';
import { createScoreText, updateScoreText } from '../ui/scoreText.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    createGameTextures(this);

    this.score = 0;
    this.gameEnding = false;
    this.shopState = loadShopState();
    this.selectedItem = findShopItem(this.shopState.selectedItemId);

    this.background = this.add.tileSprite(
      gameSettings.gameWidth / 2,
      gameSettings.gameHeight / 2,
      gameSettings.gameWidth,
      gameSettings.gameHeight,
      'spaceBackground'
    );

    // Phaser creates the arrow key controls for us.
    this.cursors = this.input.keyboard.createCursorKeys();
    this.player = new Player(this, this.selectedItem.textureKey);
    this.scoreText = createScoreText(this);

    this.stars = this.physics.add.group();
    this.rocks = this.physics.add.group();

    this.physics.add.overlap(this.player.sprite, this.stars, this.collectStar, null, this);
    this.physics.add.overlap(this.player.sprite, this.rocks, this.hitRock, null, this);
    setSmokeStateReader(() => this.readSmokeState());

    this.time.addEvent({
      delay: gameSettings.starSpawnDelay,
      callback: this.spawnStar,
      callbackScope: this,
      loop: true
    });

    this.time.delayedCall(gameSettings.rockStartDelay, () => {
      this.time.addEvent({
        delay: gameSettings.rockSpawnDelay,
        callback: this.spawnRock,
        callbackScope: this,
        loop: true
      });
    });
  }

  update(_time, delta) {
    if (this.gameEnding) {
      return;
    }

    this.background.tilePositionY -= delta * 0.012;
    this.player.update(this.cursors);
    this.clearFallenItems(this.stars);
    this.clearFallenItems(this.rocks);
  }

  spawnStar() {
    this.spawnFallingItem(this.stars, 'star');
  }

  spawnRock() {
    this.spawnFallingItem(this.rocks, 'rock');
  }

  spawnFallingItem(group, textureKey) {
    const x = Phaser.Math.Between(
      gameSettings.fallingItemSideGap,
      gameSettings.gameWidth - gameSettings.fallingItemSideGap
    );
    const currentFallSpeed = this.currentFallSpeed();
    const fallSpeed = Phaser.Math.Between(
      currentFallSpeed,
      currentFallSpeed + gameSettings.fallingItemSpeedRange
    );

    new FallingItem(this, group, textureKey, x, gameSettings.fallingItemStartY, fallSpeed);
  }

  currentFallSpeed() {
    return calculateFallSpeed(this.score);
  }

  collectStar(_playerSprite, star) {
    const starX = star.x;
    const starY = star.y;

    star.destroy();
    this.score += gameSettings.starPoints;
    updateScoreText(this.scoreText, this.score);
    playCollectSound();
    this.showSparkle(starX, starY);
  }

  hitRock() {
    if (this.gameEnding) {
      return;
    }

    this.gameEnding = true;
    playHitSound();
    this.cameras.main.shake(180, 0.006);
    this.player.sprite.setTint(0xfca5a5);
    this.physics.pause();
    const shopState = finishRound(this.score);

    this.time.delayedCall(gameSettings.hitPause, () => {
      this.scene.start('GameOverScene', {
        score: this.score,
        totalStars: shopState.stars
      });
    });
  }

  showSparkle(x, y) {
    const sparkle = this.add.text(x, y, '+1', {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '24px',
      color: '#fef3c7',
      stroke: '#172554',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.tweens.add({
      targets: sparkle,
      y: y - 30,
      alpha: 0,
      duration: gameSettings.sparkleDuration,
      onComplete: () => sparkle.destroy()
    });
  }

  clearFallenItems(group) {
    group.children.each((item) => {
      if (item.active && item.y > gameSettings.gameHeight + gameSettings.fallingItemClearGap) {
        item.destroy();
      }
    });
  }

  readSmokeState() {
    return {
      scene: 'GameScene',
      score: this.score,
      selectedItemId: this.selectedItem.id,
      playerTextureKey: this.selectedItem.textureKey,
      playerX: this.player.sprite.x,
      playerY: this.player.sprite.y,
      stars: this.readGroupPositions(this.stars),
      rocks: this.readGroupPositions(this.rocks)
    };
  }

  readGroupPositions(group) {
    return group.getChildren()
      .filter((item) => item.active)
      .map((item) => ({
        x: item.x,
        y: item.y
      }));
  }
}
