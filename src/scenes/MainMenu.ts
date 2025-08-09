import Phaser from 'phaser';
import SaveManager, { GameSnapshot } from '../systems/SaveManager';

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2,
        'Main Menu\nN New Game\n1-3 Load Slot\n0 Load Autosave',
        { align: 'center' }
      )
      .setOrigin(0.5);

    this.input.keyboard.on('keydown-N', () => {
      const fresh: GameSnapshot = {
        levelId: 'level1',
        checkpointId: 'start',
        player: { x: 0, y: 0, hp: 100, inventory: [] },
        inkStateJson: null,
        flags: {}
      };
      SaveManager.loadCurrent(fresh);
      this.scene.start('Play');
    });

    const loadSlot = (slot: number) => {
      const snap = SaveManager.loadSlot(slot);
      if (snap) {
        this.scene.start('Play', { snapshot: snap });
      }
    };

    this.input.keyboard.on('keydown-ONE', () => loadSlot(1));
    this.input.keyboard.on('keydown-TWO', () => loadSlot(2));
    this.input.keyboard.on('keydown-THREE', () => loadSlot(3));

    this.input.keyboard.on('keydown-ZERO', () => {
      const snap = SaveManager.loadAuto();
      if (snap) {
        this.scene.start('Play', { snapshot: snap });
      }
    });
  }
}
