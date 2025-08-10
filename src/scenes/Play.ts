import Phaser from 'phaser';
import LDtkLoader from '../systems/LDtkLoader';
import Player from '../entities/Player';
import DialogueTrigger from '../entities/DialogueTrigger';
import PhysicsAdapter from '../physics/PhysicsAdapter';
import ArcadeAdapter from '../physics/ArcadeAdapter';
import SaveManager, { GameSnapshot } from '../systems/SaveManager';

export default class Play extends Phaser.Scene {
  private player!: Player;
  private physicsAdapter!: PhysicsAdapter;
  private debugText!: Phaser.GameObjects.Text;
  private checkpointId = 'start';
  private startSnapshot?: GameSnapshot;

  constructor() {
    super('Play');
  }

  async create(data?: { snapshot?: GameSnapshot }) {
    this.startSnapshot = data?.snapshot;
    this.physicsAdapter = new ArcadeAdapter(this);
    this.physicsAdapter.setGravity(0, 500);
    await this.loadLevel();

    // Hotkey to switch to Visual Novel scene
    this.input.keyboard.on('keydown-V', () => {
      SaveManager.saveAuto();
      this.scene.start('VisualNovel');
    });

    // Debug key to retry loading the level
    this.input.keyboard.on('keydown-L', () => {
      this.scene.restart();
    });

    // Simulated checkpoint and level completion
    this.input.keyboard.on('keydown-C', () => this.hitCheckpoint('checkpoint'));
    this.input.keyboard.on('keydown-K', () => this.hitCheckpoint('complete'));

    // Pause menu
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.launch('Pause');
    });
  }

  private async loadLevel() {
    try {
      const loader = new LDtkLoader(this, this.physicsAdapter);
      const { collisionLayer, entities } = loader.load('world.ldtk', {
        levelId: 'lvl_01_test',
        factories: {
          spawn: Player,
          dialogue: DialogueTrigger
        }
      });

      this.player = entities.find((e) => e instanceof Player) as Player;
      if (this.startSnapshot) {
        this.checkpointId = this.startSnapshot.checkpointId;
        this.player.restore(this.startSnapshot.player);
      }
      SaveManager.updateLevel('lvl_01_test', this.checkpointId);
      SaveManager.updatePlayer(this.player.getSnapshot());
      SaveManager.saveAuto();

      entities.forEach((e) => {
        if (e instanceof DialogueTrigger) {
          e.setup(this.player);
        }
      });

      if (collisionLayer) {
        this.physicsAdapter.collide(this.player, collisionLayer);
      }

      this.cameras.main.startFollow(this.player);
      this.createDebugOverlay();
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
      this.physicsAdapter.createBody('static', { gameObject: ground, width, height: groundHeight });

      this.player = new Player(
        this,
        this.physicsAdapter,
        width / 2,
        height - groundHeight - 50
      );
      this.physicsAdapter.collide(this.player, ground);

      if (this.startSnapshot) {
        this.checkpointId = this.startSnapshot.checkpointId;
        this.player.restore(this.startSnapshot.player);
      }
      SaveManager.updateLevel('lvl_01_test', this.checkpointId);
      SaveManager.updatePlayer(this.player.getSnapshot());
      SaveManager.saveAuto();

      this.cameras.main.startFollow(this.player);
      this.createDebugOverlay();
    }
  }

  private createDebugOverlay() {
    this.debugText = this.add
      .text(10, 10, '', { fontSize: '12px', color: '#fff' })
      .setScrollFactor(0);
  }

  update() {
    if (!this.player || !this.debugText) return;
    SaveManager.updatePlayer(this.player.getSnapshot());
    const input = this.player.input;
    const move = input.move;
    const look = input.look;
    this.debugText.setText(
      `move: (${move.x.toFixed(2)}, ${move.y.toFixed(2)})\n` +
        `look: (${look.x.toFixed(2)}, ${look.y.toFixed(2)})\n` +
        `jump: ${input.jumpPressed}\n` +
        `interact: ${input.interact}\n` +
        `drop: ${input.dropThrough}`
    );
  }

  // Simulated checkpoint trigger for autosave
  public hitCheckpoint(id: string) {
    this.checkpointId = id;
    SaveManager.updateLevel('lvl_01_test', this.checkpointId);
    SaveManager.updatePlayer(this.player.getSnapshot());
    SaveManager.saveAuto();
  }
}
