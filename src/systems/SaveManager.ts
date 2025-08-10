export interface PlayerSnapshot {
  x: number;
  y: number;
  hp: number;
  inventory: string[];
}

export interface GameSnapshot {
  levelId: string;
  checkpointId: string;
  player: PlayerSnapshot;
  inkStateJson: string | null;
  flags: Record<string, any>;
}

export default class SaveManager {
  private static readonly AUTO_KEY = 'autosave';
  private static readonly SLOT_PREFIX = 'save_slot_';

  private static current: GameSnapshot = {
    levelId: 'lvl_01',
    checkpointId: 'start',
    player: { x: 0, y: 0, hp: 100, inventory: [] },
    inkStateJson: null,
    flags: {}
  };

  static getSnapshot(): GameSnapshot {
    return this.current;
  }

  static loadCurrent(snapshot: GameSnapshot) {
    this.current = snapshot;
  }

  static updatePlayer(player: PlayerSnapshot) {
    this.current.player = player;
  }

  static updateLevel(levelId: string, checkpointId: string) {
    this.current.levelId = levelId;
    this.current.checkpointId = checkpointId;
  }

  static updateInkState(state: string | null) {
    this.current.inkStateJson = state;
  }

  static updateFlags(flags: Record<string, any>) {
    this.current.flags = flags;
  }

  static getFlag(key: string) {
    return this.current.flags[key];
  }

  static setFlag(key: string, value: any = true) {
    this.current.flags[key] = value;
  }

  static saveAuto() {
    try {
      localStorage.setItem(this.AUTO_KEY, JSON.stringify(this.current));
    } catch (err) {
      // ignore storage errors
    }
  }

  static loadAuto(): GameSnapshot | null {
    try {
      const raw = localStorage.getItem(this.AUTO_KEY);
      if (!raw) return null;
      const snap = JSON.parse(raw) as GameSnapshot;
      this.current = snap;
      return snap;
    } catch {
      return null;
    }
  }

  static saveSlot(slot: number) {
    try {
      localStorage.setItem(this.SLOT_PREFIX + slot, JSON.stringify(this.current));
    } catch (err) {
      // ignore
    }
  }

  static loadSlot(slot: number): GameSnapshot | null {
    try {
      const raw = localStorage.getItem(this.SLOT_PREFIX + slot);
      if (!raw) return null;
      const snap = JSON.parse(raw) as GameSnapshot;
      this.current = snap;
      return snap;
    } catch {
      return null;
    }
  }
}
