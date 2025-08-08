import Phaser from 'phaser';

interface SimpleLayer {
  name: string;
  data: number[][];
  collides?: boolean;
}

interface SimpleLDtk {
  tileSize: number;
  width: number;
  height: number;
  layers: SimpleLayer[];
}

export default class LDtkLoader {
  constructor(private scene: Phaser.Scene) {}

  load(key: string) {
    const data = this.scene.cache.json.get(key) as SimpleLDtk;
    let collisionLayer: Phaser.Tilemaps.TilemapLayer | null = null;

    data.layers.forEach((layer) => {
      const map = this.scene.make.tilemap({
        data: layer.data,
        tileWidth: data.tileSize,
        tileHeight: data.tileSize
      });
      const tiles = map.addTilesetImage('tiles');
      const tileLayer = map.createLayer(0, tiles, 0, 0);
      if (layer.collides) {
        tileLayer.setCollisionByExclusion([-1]);
        collisionLayer = tileLayer;
      }
    });

    return { collisionLayer };
  }
}
