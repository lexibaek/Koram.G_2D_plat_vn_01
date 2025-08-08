import Phaser from 'phaser';
import LDtkLoader from '../systems/LDtkLoader';
import Player from '../entities/Player';

export default class Play extends Phaser.Scene {
  private player!: Player;

  constructor() {
    super('Play');
  }

  create() {
    const loader = new LDtkLoader(this);
    const { collisionLayer, entities } = loader.load('level1', {
      SpawnPoint: Player
    });

    this.player = entities.find((e) => e instanceof Player) as Player;

    if (collisionLayer) {
      this.physics.add.collider(this.player, collisionLayer);
    }

    this.cameras.main.startFollow(this.player);

    // Hotkey to switch to Visual Novel scene
    this.input.keyboard.on('keydown-V', () => {
      this.scene.start('VisualNovel');
    });
  }
}
