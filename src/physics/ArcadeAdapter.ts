import Phaser from 'phaser';
import PhysicsAdapter, { PhysicsBody, BodyOptions } from './PhysicsAdapter';

export default class ArcadeAdapter implements PhysicsAdapter {
  constructor(private scene: Phaser.Scene) {}

  setGravity(x: number, y: number): void {
    this.scene.physics.world.gravity.set(x, y);
  }

  createBody(type: 'dynamic' | 'static', opts: BodyOptions): PhysicsBody {
    this.scene.physics.add.existing(opts.gameObject, type === 'static');
    const body = (opts.gameObject.body as Phaser.Physics.Arcade.Body);
    if (opts.width && opts.height) body.setSize(opts.width, opts.height);
    if (opts.offsetX || opts.offsetY) body.setOffset(opts.offsetX ?? 0, opts.offsetY ?? 0);
    if (opts.immovable !== undefined) body.setImmovable(opts.immovable);
    if (opts.allowGravity === false) body.setAllowGravity(false);
    return { raw: body };
  }

  setVelocity(body: PhysicsBody, vx: number, vy: number): void {
    (body.raw as Phaser.Physics.Arcade.Body).setVelocity(vx, vy);
  }

  applyImpulse(body: PhysicsBody, vx: number, vy: number): void {
    const b = body.raw as Phaser.Physics.Arcade.Body;
    b.setVelocity(b.velocity.x + vx, b.velocity.y + vy);
  }

  collide(obj1: any, obj2: any, cb?: Phaser.Types.Physics.Arcade.ArcadeColliderCallback) {
    return this.scene.physics.add.collider(obj1, obj2, cb);
  }

  overlap(obj1: any, obj2: any, cb?: Phaser.Types.Physics.Arcade.ArcadeColliderCallback) {
    return this.scene.physics.add.overlap(obj1, obj2, cb);
  }

  raycast(from: Phaser.Math.Vector2, to: Phaser.Math.Vector2) {
    // Stub: Arcade Physics doesn't have built-in raycast
    return null;
  }

  destroy(): void {
    // no-op for Arcade
  }
}
