import Phaser from 'phaser';
import PhysicsAdapter from '../physics/PhysicsAdapter';

export default class DialogueTrigger extends Phaser.GameObjects.Zone {
  private physics: PhysicsAdapter;

  constructor(scene: Phaser.Scene, physics: PhysicsAdapter, x: number, y: number) {
    super(scene, x, y, 32, 32);
    this.physics = physics;
    scene.add.existing(this);
    this.setOrigin(0, 0);
    this.physics.createBody('static', {
      gameObject: this,
      width: 32,
      height: 32,
      immovable: true,
      allowGravity: false
    });
  }

  setup(player: Phaser.GameObjects.GameObject) {
    this.physics.overlap(player, this, () => {
      this.scene.scene.start('VisualNovel');
    });
  }
}
