import Phaser from 'phaser';
import LDtkLoader from '../systems/LDtkLoader';
import InputManager from '../systems/InputManager';

export default class Play extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private inputManager!: InputManager;

  constructor() {
    super('Play');
  }

  create() {
    const loader = new LDtkLoader(this);
    const level = loader.load('level1');

    this.player = this.physics.add.sprite(100, 100, 'player');
    this.player.setBounce(0.1);

    if (level.collisionLayer) {
      this.physics.add.collider(this.player, level.collisionLayer);
    }

    this.cameras.main.startFollow(this.player);

    this.inputManager = new InputManager(this);

    // Hotkey to switch to Visual Novel scene
    this.input.keyboard.on('keydown-V', () => {
      this.scene.start('VisualNovel');
    });
  }

  update() {
    const speed = 160;
    if (this.inputManager.left) {
      this.player.setVelocityX(-speed);
    } else if (this.inputManager.right) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.inputManager.jump && this.player.body.blocked.down) {
      this.player.setVelocityY(-330);
    }
  }
}
