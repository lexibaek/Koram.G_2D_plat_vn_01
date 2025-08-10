import Phaser from 'phaser';
import PhysicsAdapter from '../physics/PhysicsAdapter';
import SaveManager from '../systems/SaveManager';

export default class Pickup extends Phaser.GameObjects.Zone {
  private physics: PhysicsAdapter;
  private flag: string;

  constructor(
    scene: Phaser.Scene,
    physics: PhysicsAdapter,
    x: number,
    y: number,
    data?: Record<string, any>
  ) {
    super(scene, x, y, 32, 32);
    this.physics = physics;
    this.flag = data?.grantsVar || data?.id || 'pickup';
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
    if (SaveManager.getFlag(this.flag)) {
      this.destroy();
      return;
    }

    this.physics.overlap(player, this, () => {
      SaveManager.setFlag(this.flag, true);
      SaveManager.saveAuto();
      this.destroy();
    });
  }
}
