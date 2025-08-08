import Phaser from 'phaser';

export default class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Load configuration or any immediate assets
    this.load.json('config', '/config.json');
  }

  create() {
    // Once basic config is ready, move to preload scene
    this.scene.start('Preload');
  }
}
