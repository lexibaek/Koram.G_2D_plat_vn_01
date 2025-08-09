import Phaser from 'phaser';
import manifest from '../config/manifest.json';
import ManifestLoader from '../systems/ManifestLoader';
import SaveManager from '../systems/SaveManager';

export default class Preload extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    const loader = new ManifestLoader(this.load);
    loader.load(manifest);
  }

  create() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xcccccc, 1);
    graphics.fillRect(0, 0, 16, 16);
    graphics.fillStyle(0x888888, 1);
    graphics.fillRect(16, 16, 16, 16);
    graphics.generateTexture('tile32', 32, 32);
    graphics.destroy();

    const snap = SaveManager.loadAuto();
    if (snap) {
      this.scene.start('Play', { snapshot: snap });
    } else {
      this.scene.start('MainMenu');
    }
  }
}
