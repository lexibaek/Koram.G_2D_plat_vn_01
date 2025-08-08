import Phaser from 'phaser';

export default class DialogueTrigger extends Phaser.GameObjects.Zone {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 32, 32);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0, 0);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
  }

  setup(player: Phaser.GameObjects.GameObject) {
    this.scene.physics.add.overlap(player, this, () => {
      this.scene.scene.start('VisualNovel');
    });
  }
}
