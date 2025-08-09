import Phaser from 'phaser';
import PhysicsAdapter from '../physics/PhysicsAdapter';

type EntityConstructor = new (
  scene: Phaser.Scene,
  physics: PhysicsAdapter,
  x: number,
  y: number,
  data?: Record<string, any>
) => Phaser.GameObjects.GameObject;

interface LDtkField {
  __identifier: string;
  __value: any;
}

interface LDtkEntity {
  __identifier: string;
  px: [number, number];
  fieldInstances?: LDtkField[];
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
  constructor(private scene: Phaser.Scene, private physics: PhysicsAdapter) {}

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
        const tiles = map.addTilesetImage('tile32');
        const tileLayer = map.createLayer(0, tiles, 0, 0);
        if (layer.__identifier === 'Ground') {
          tileLayer.setCollisionByExclusion([-1]);
          collisionLayer = tileLayer;
        }
      } else if (
        (layer.__type === 'Tiles' || layer.__type === 'AutoLayer') &&
        (layer as any).gridTiles
      ) {
        const width = layer.__cWid ?? 0;
        const height = layer.__cHei ?? 0;
        const grid: number[][] = Array.from({ length: height }, () =>
          Array(width).fill(-1)
        );
        const tilesData = (layer as any).gridTiles as {
          px: [number, number];
        }[];
        tilesData.forEach((t) => {
          const gx = Math.floor(t.px[0] / (layer.gridSize ?? 1));
          const gy = Math.floor(t.px[1] / (layer.gridSize ?? 1));
          if (gy >= 0 && gy < height && gx >= 0 && gx < width) {
            grid[gy][gx] = 0;
          }
        });
        const map = this.scene.make.tilemap({
          data: grid,
          tileWidth: layer.gridSize ?? 0,
          tileHeight: layer.gridSize ?? 0
        });
        const tiles = map.addTilesetImage('tile32');
        const tileLayer = map.createLayer(0, tiles, 0, 0);
        if (layer.__identifier === 'Ground') {
          tileLayer.setCollisionByExclusion([-1]);
          collisionLayer = tileLayer;
        }
      } else if (layer.__type === 'Entities' && layer.entityInstances) {
        layer.entityInstances.forEach((entity) => {
          const Ctor = entityMap[entity.__identifier];
          if (Ctor) {
            const fields: Record<string, any> = {};
            entity.fieldInstances?.forEach((f) => {
              fields[f.__identifier] = f.__value;
            });
            const obj = new Ctor(
              this.scene,
              this.physics,
              entity.px[0],
              entity.px[1],
              fields
            );
            entities.push(obj);
          }
        });
      }
    });

    return { collisionLayer, entities };
  }
}
