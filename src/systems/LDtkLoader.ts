import Phaser from 'phaser';

type EntityConstructor = new (scene: Phaser.Scene, x: number, y: number) => Phaser.GameObjects.GameObject;

interface LDtkEntity {
  __identifier: string;
  px: [number, number];
}

interface LDtkLayer {
  __identifier: string;
  __type: string;
  gridSize?: number;
  intGridCsv?: number[];
  __cWid?: number;
  __cHei?: number;
  entityInstances?: LDtkEntity[];
}

interface LDtkLevel {
  pxWid: number;
  pxHei: number;
  layerInstances: LDtkLayer[];
}

export default class LDtkLoader {
  constructor(private scene: Phaser.Scene) {}

  load(key: string, entityMap: Record<string, EntityConstructor> = {}) {
    const data = this.scene.cache.json.get(key) as LDtkLevel;
    let collisionLayer: Phaser.Tilemaps.TilemapLayer | null = null;
    const entities: Phaser.GameObjects.GameObject[] = [];

    data.layerInstances.forEach((layer) => {
      if (layer.__type === 'IntGrid' && layer.intGridCsv) {
        const width = layer.__cWid ?? 0;
        const height = layer.__cHei ?? 0;
        const grid: number[][] = [];
        for (let y = 0; y < height; y++) {
          const row: number[] = [];
          for (let x = 0; x < width; x++) {
            const val = layer.intGridCsv[y * width + x];
            row.push(val > 0 ? 0 : -1);
          }
          grid.push(row);
        }
        const map = this.scene.make.tilemap({
          data: grid,
          tileWidth: layer.gridSize ?? 0,
          tileHeight: layer.gridSize ?? 0
        });
        const tiles = map.addTilesetImage('tiles');
        const tileLayer = map.createLayer(0, tiles, 0, 0);
        tileLayer.setCollisionByExclusion([-1]);
        collisionLayer = tileLayer;
      } else if (layer.__type === 'Entities' && layer.entityInstances) {
        layer.entityInstances.forEach((entity) => {
          const Ctor = entityMap[entity.__identifier];
          if (Ctor) {
            const obj = new Ctor(this.scene, entity.px[0], entity.px[1]);
            entities.push(obj);
          }
        });
      }
    });

    return { collisionLayer, entities };
  }
}
