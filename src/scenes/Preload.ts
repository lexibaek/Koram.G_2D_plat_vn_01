import Phaser from 'phaser';

export default class Preload extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    // Load placeholder assets
    this.load.image(
      'tiles',
      'https://labs.phaser.io/assets/tilemaps/tiles/drawtiles-spaced.png'
    );
    this.load.spritesheet(
      'player',
      'https://labs.phaser.io/assets/sprites/dude.png',
      { frameWidth: 32, frameHeight: 48 }
    );
    this.load.audio(
      'jump',
      'https://labs.phaser.io/assets/audio/SoundEffects/key.wav'
    );
    // Placeholder LDtk level and ink story
    this.load.json('level1', '/levels/placeholder.ldtk');
    this.load.json('inkTest', '/dialogue/sample.ink.json');
  }

  create() {
    this.scene.start('Play');
  }
}
