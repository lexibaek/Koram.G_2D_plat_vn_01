import Phaser from "phaser";

export interface PhysicsBody {
  /** Underlying physics-specific body */
  raw: any;
}

export interface BodyOptions {
  gameObject: Phaser.GameObjects.GameObject;
  width?: number;
  height?: number;
  offsetX?: number;
  offsetY?: number;
  immovable?: boolean;
  allowGravity?: boolean;
}

export default interface PhysicsAdapter {
  setGravity(x: number, y: number): void;
  createBody(type: 'dynamic' | 'static', opts: BodyOptions): PhysicsBody;
  setVelocity(body: PhysicsBody, vx: number, vy: number): void;
  applyImpulse(body: PhysicsBody, vx: number, vy: number): void;
  collide(obj1: any, obj2: any, cb?: Phaser.Types.Physics.Arcade.ArcadeColliderCallback): Phaser.Physics.Arcade.Collider | void;
  overlap(obj1: any, obj2: any, cb?: Phaser.Types.Physics.Arcade.ArcadeColliderCallback): Phaser.Physics.Arcade.Collider | void;
  raycast(from: Phaser.Math.Vector2, to: Phaser.Math.Vector2): any;
  destroy(): void;
}
