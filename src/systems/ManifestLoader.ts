import Phaser from 'phaser';

interface Manifest {
  atlases: string[];
  tilesets: string[];
  levels: string[];
  audio: {
    bgm: string[];
    sfx: string[];
  };
  fonts: string[];
}

interface LDtkProject {
  levels?: { externalRelPath: string }[];
}

export default class ManifestLoader {
  private queued = new Set<string>();
  constructor(private loader: Phaser.Loader.LoaderPlugin) {}

  load(manifest: Manifest) {
    this.validate(manifest);

    manifest.tilesets.forEach((path) => {
      const key = this.keyFromPath(path);
      this.loader.image(key, [path + '.webp', path + '.png']);
    });

    manifest.atlases.forEach((path) => {
      const key = this.keyFromPath(path);
      this.loader.atlas(key, path + '.json', [path + '.webp', path + '.png']);
    });

    manifest.levels.forEach((path) => {
      if (this.queued.has(path)) {
        return;
      }
      const key = this.keyFromPath(path);
      this.loader.json(key, path);
      this.queued.add(path);
      if (path.endsWith('.ldtk')) {
        const base = path.substring(0, path.lastIndexOf('/') + 1);
        this.loader.once(`filecomplete-json-${key}`, (_key: string, _type: string, data: LDtkProject) => {
          data.levels?.forEach((level) => {
            const levelPath = base + level.externalRelPath;
            if (!this.queued.has(levelPath)) {
              const levelKey = this.keyFromPath(levelPath);
              this.loader.json(levelKey, levelPath);
              this.queued.add(levelPath);
            }
          });
        });
      }
    });

    manifest.audio.bgm.forEach((path) => {
      const key = this.keyFromPath(path);
      this.loader.audio(key, [path + '.ogg', path + '.mp3']);
    });

    manifest.audio.sfx.forEach((path) => {
      const key = this.keyFromPath(path);
      this.loader.audio(key, [path + '.ogg', path + '.mp3']);
    });

    // Fonts are included for completeness; implementation depends on font type.
  }

  private validate(manifest: Manifest) {
    const required: (keyof Manifest)[] = [
      'atlases',
      'tilesets',
      'levels',
      'audio',
      'fonts'
    ];
    for (const key of required) {
      if (!(key in manifest)) {
        throw new Error(`Manifest missing key: ${key}`);
      }
    }
    if (!manifest.levels || manifest.levels.length === 0) {
      throw new Error('Manifest missing key: levels');
    }
    if (!manifest.audio.bgm) {
      throw new Error('Manifest missing key: audio.bgm');
    }
    if (!manifest.audio.sfx) {
      throw new Error('Manifest missing key: audio.sfx');
    }
  }

  private keyFromPath(path: string) {
    const parts = path.split('/');
    return parts[parts.length - 1];
  }
}
