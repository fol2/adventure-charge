import { gameSettings } from '../data/gameSettings.js';

export class Player {
  constructor(scene) {
    this.sprite = scene.physics.add.image(
      gameSettings.gameWidth / 2,
      gameSettings.gameHeight - gameSettings.playerBottomGap,
      'player'
    );

    this.sprite.setCollideWorldBounds(true);
    this.sprite.setImmovable(true);
    this.sprite.body.setAllowGravity(false);
    this.sprite.body.setSize(gameSettings.playerWidth - 10, gameSettings.playerHeight - 8);
  }

  update(cursors) {
    this.sprite.setVelocityX(0);

    if (cursors.left.isDown) {
      this.sprite.setVelocityX(-gameSettings.playerSpeed);
    }

    if (cursors.right.isDown) {
      this.sprite.setVelocityX(gameSettings.playerSpeed);
    }
  }
}
