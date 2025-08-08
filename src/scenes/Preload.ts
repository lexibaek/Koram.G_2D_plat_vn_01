import Phaser from 'phaser';
import manifest from '../config/manifest.json';
import ManifestLoader from '../systems/ManifestLoader';

export default class Preload extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    const loader = new ManifestLoader(this.load);
    loader.load(manifest);
  }

  create() {
    this.scene.start('Play');
  }
}
