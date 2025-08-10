import Phaser from 'phaser';
import PhysicsAdapter from '../physics/PhysicsAdapter';
import SaveManager from '../systems/SaveManager';
import Player from './Player';

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
    const collected =
      this.flag === 'dash'
        ? SaveManager.getFlag('dashUnlocked')
        : SaveManager.getFlag(this.flag);
    if (collected) {
      this.destroy();
      return;
    }

    this.physics.overlap(player, this, () => {
      if (this.flag === 'dash') {
        SaveManager.setFlag('dashUnlocked', true);
        SaveManager.setFlag('dash', true);
      } else {
        SaveManager.setFlag(this.flag, true);
      }
      if (player instanceof Player) {
        player.obtain(this.flag);
      }
      SaveManager.saveAuto();
      this.emit('collected', this.flag);
      this.destroy();
    });
  }
}
