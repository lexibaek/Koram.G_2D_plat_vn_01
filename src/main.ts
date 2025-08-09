import Phaser from 'phaser';
import Boot from './scenes/Boot';
import Preload from './scenes/Preload';
import MainMenu from './scenes/MainMenu';
import Play from './scenes/Play';
import VisualNovel from './scenes/VisualNovel';
import Pause from './scenes/Pause';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'app',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: [Boot, Preload, MainMenu, Play, VisualNovel, Pause]
};

export default new Phaser.Game(config);
