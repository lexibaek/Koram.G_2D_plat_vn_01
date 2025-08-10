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
  // Tiles data is loosely typed; we only read px
  gridTiles?: { px: [number, number] }[];
}

interface LDtkLevel {
  pxWid: number;
  pxHei: number;
  layerInstances: LDtkLayer[];
}

interface LDtkProjectLevelRef {
  identifier: string;
  externalRelPath: string;
}

interface LDtkProject {
  levels: LDtkProjectLevelRef[];
}

interface LoadOptions {
  levelId?: string;
  factories?: Record<string, EntityConstructor>;
}

export default class LDtkLoader {
  constructor(private scene: Phaser.Scene, private physics: PhysicsAdapter) {}

  private keyFromPath(path: string) {
    return path.replace(/\//g, '_');
  }

  load(
    path: string,
    options: LoadOptions | Record<string, EntityConstructor> = {}
  ) {
    // Backward compatibility: allow passing factories map directly
    const opts: LoadOptions = (options as LoadOptions).factories
      ? (options as LoadOptions)
      : { factories: options as Record<string, EntityConstructor> };

    const factories = opts.factories ?? {};

    const cacheKey = this.keyFromPath(path);

    if (path.endsWith('.ldtk')) {
      if (!opts.levelId) {
        throw new Error(
          'LDtkLoader: levelId is required when loading a .ldtk project'
        );
      }
      const project = this.scene.cache.json.get(cacheKey) as LDtkProject;
      const levelRef = project?.levels?.find(
        (l) => l.identifier === opts.levelId
      );
      if (!levelRef) {
        throw new Error(
          `LDtkLoader: level '${opts.levelId}' not found in ${path}`
        );
      }
      const levelKey = this.keyFromPath(levelRef.externalRelPath);
      const levelData = this.scene.cache.json.get(levelKey) as LDtkLevel;
      return this.buildLevel(levelData, factories);
    }

    const levelData = this.scene.cache.json.get(cacheKey) as LDtkLevel;
    return this.buildLevel(levelData, factories);
  }

  private buildLevel(
    data: LDtkLevel,
    factories: Record<string, EntityConstructor>
  ) {
    let collisionLayer: Phaser.Tilemaps.TilemapLayer | null = null;
    const entities: Phaser.GameObjects.GameObject[] = [];
    let hasCollision = false;
    let hasEntities = false;

    data.layerInstances.forEach((layer) => {
      if (
        layer.__type === 'IntGrid' &&
        layer.intGridCsv &&
        (layer.__identifier === 'Collision' || layer.__identifier === 'Ground')
      ) {
        hasCollision = true;
        const width = layer.__cWid ?? 0;
        const height = layer.__cHei ?? 0;
        const grid: number[][] = [];
        for (let y = 0; y < height; y++) {
          const row: number[] = [];
          for (let x = 0; x < width; x++) {
            const val = layer.intGridCsv[y * width + x];
            row.push(val === 1 ? 0 : -1);
          }
          row.length && grid.push(row);
        }
        const map = this.scene.make.tilemap({
          data: grid,
          tileWidth: layer.gridSize ?? 0,
          tileHeight: layer.gridSize ?? 0
        });
        const tiles = map.addTilesetImage('tile32');
        const tileLayer = map.createLayer(0, tiles, 0, 0);
        tileLayer.setCollisionByExclusion([-1]);
        collisionLayer = tileLayer;
      } else if (
        (layer.__type === 'Tiles' || layer.__type === 'AutoLayer') &&
        (layer.__identifier === 'Background' || layer.__identifier === 'Foreground') &&
        layer.gridTiles
      ) {
        // Currently ignored; kept for future use
      } else if (
        layer.__type === 'Entities' &&
        layer.__identifier === 'Entities' &&
        layer.entityInstances
      ) {
        hasEntities = true;
        layer.entityInstances.forEach((entity) => {
          const Ctor = factories[entity.__identifier];
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

    if (!hasCollision) {
      console.warn('LDtkLoader: Collision layer missing');
    }
    if (!hasEntities) {
      console.warn('LDtkLoader: Entities layer missing');
    }

    return { collisionLayer, entities };
  }
}

