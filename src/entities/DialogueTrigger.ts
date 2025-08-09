import Phaser from 'phaser';
import PhysicsAdapter from '../physics/PhysicsAdapter';
import SaveManager from '../systems/SaveManager';

export default class DialogueTrigger extends Phaser.GameObjects.Zone {
  private physics: PhysicsAdapter;
  private knot?: string;
  private once = false;
  private id: string;

  constructor(
    scene: Phaser.Scene,
    physics: PhysicsAdapter,
    x: number,
    y: number,
    data?: Record<string, any>
  ) {
    super(scene, x, y, 32, 32);
    this.physics = physics;
    this.knot = data?.knot;
    this.once = !!data?.once;
    this.id = data?.id || this.knot || `${x}_${y}`;
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
    if (this.once && SaveManager.getFlag(`dialogue_${this.id}`)) {
      this.destroy();
      return;
    }

    this.physics.overlap(player, this, () => {
      if (this.once) {
        SaveManager.setFlag(`dialogue_${this.id}`, true);
        SaveManager.saveAuto();
      }
      this.scene.scene.start('VisualNovel', { knot: this.knot });
    });
  }
}
