import Phaser from 'phaser';
import SaveManager from '../systems/SaveManager';

export default class Pause extends Phaser.Scene {
  constructor() {
    super('Pause');
  }

  create() {
    this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2,
        'Paused\n1-3 Save\n7-9 Load\nM Main Menu\nEsc Resume',
        { align: 'center' }
      )
      .setOrigin(0.5);

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.stop();
      this.scene.resume('Play');
      this.scene.resume('VisualNovel');
    });

    const save = (slot: number) => SaveManager.saveSlot(slot);
    const load = (slot: number) => {
      const snap = SaveManager.loadSlot(slot);
      if (snap) {
        this.scene.stop('Play');
        this.scene.stop('VisualNovel');
        this.scene.stop();
        this.scene.start('Play', { snapshot: snap });
      }
    };

    this.input.keyboard.on('keydown-ONE', () => save(1));
    this.input.keyboard.on('keydown-TWO', () => save(2));
    this.input.keyboard.on('keydown-THREE', () => save(3));

    this.input.keyboard.on('keydown-SEVEN', () => load(1));
    this.input.keyboard.on('keydown-EIGHT', () => load(2));
    this.input.keyboard.on('keydown-NINE', () => load(3));

    this.input.keyboard.on('keydown-M', () => {
      this.scene.stop('Play');
      this.scene.stop('VisualNovel');
      this.scene.stop();
      this.scene.start('MainMenu');
    });
  }
}
