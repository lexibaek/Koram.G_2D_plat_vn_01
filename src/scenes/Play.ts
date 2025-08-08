import Phaser from 'phaser';
import LDtkLoader from '../systems/LDtkLoader';
import Player from '../entities/Player';

export default class Play extends Phaser.Scene {
  private player!: Player;

  constructor() {
    super('Play');
  }

  async create() {
    await this.loadLevel();

    // Hotkey to switch to Visual Novel scene
    this.input.keyboard.on('keydown-V', () => {
      this.scene.start('VisualNovel');
    });

    // Debug key to retry loading the level
    this.input.keyboard.on('keydown-L', () => {
      this.scene.restart();
    });
  }

  private async loadLevel() {
    this.cache.json.remove('level1');
    try {
      const response = await fetch('/levels/lvl_01_test.json');
      if (!response.ok) throw new Error('Missing level');
      const data = await response.json();
      this.cache.json.add('level1', data);
      const loader = new LDtkLoader(this);
      const { collisionLayer, entities } = loader.load('level1', {
        SpawnPoint: Player
      });

      this.player = entities.find((e) => e instanceof Player) as Player;

      if (collisionLayer) {
        this.physics.add.collider(this.player, collisionLayer);
      }

      this.cameras.main.startFollow(this.player);
    } catch (err) {
      const width = this.scale.width;
      const height = this.scale.height;
      this.add
        .text(width / 2, height / 2, 'Level not available')
        .setOrigin(0.5);

      const groundHeight = 50;
      const ground = this.add
        .rectangle(0, height - groundHeight, width, groundHeight, 0x00ff00)
        .setOrigin(0, 0);
      this.physics.add.existing(ground, true);

      this.player = new Player(
        this,
        width / 2,
        height - groundHeight - 50
      );
      this.physics.add.collider(this.player, ground);

      this.cameras.main.startFollow(this.player);
    }
  }
}
