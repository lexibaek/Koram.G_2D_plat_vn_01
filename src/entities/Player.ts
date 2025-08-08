import Phaser from 'phaser';
import InputManager from '../systems/InputManager';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  private input: InputManager;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setBounce(0.1);
    this.input = new InputManager(scene);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    const speed = 160;
    if (this.input.left) {
      this.setVelocityX(-speed);
    } else if (this.input.right) {
      this.setVelocityX(speed);
    } else {
      this.setVelocityX(0);
    }
    if (this.input.jump && this.body.blocked.down) {
      this.setVelocityY(-330);
    }
  }
}
