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
    const snap = SaveManager.loadAuto();
    if (snap) {
      this.scene.start('Play', { snapshot: snap });
    } else {
      this.scene.start('MainMenu');
    }
  }
}
