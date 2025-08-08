import Phaser from 'phaser';

export default class Preload extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    // Create a single-tile checkerboard texture in memory
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillRect(16, 16, 16, 16);
    }
    const dataURL = canvas.toDataURL('image/png');
    this.textures.addBase64('tiles', dataURL);
    this.load.spritesheet(
      'player',
      'https://labs.phaser.io/assets/sprites/dude.png',
      { frameWidth: 32, frameHeight: 48 }
    );
    this.load.audio(
      'jump',
      'https://labs.phaser.io/assets/audio/SoundEffects/key.wav'
    );
    // Ink story
    this.load.json('inkTest', '/dialogue/sample.ink.json');
  }

  create() {
    this.scene.start('Play');
  }
}
