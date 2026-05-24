export class FallingItem {
  constructor(scene, group, textureKey, x, y, fallSpeed) {
    this.sprite = group.create(x, y, textureKey);
    this.sprite.body.setAllowGravity(false);
    this.sprite.setVelocityY(fallSpeed);
  }
}
