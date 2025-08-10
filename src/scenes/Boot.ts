import Phaser from 'phaser';

export default class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // No configuration needed at boot time
  }

  create() {
    // Once basic config is ready, move to preload scene
    this.scene.start('Preload');
  }
}
