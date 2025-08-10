import Phaser from 'phaser';
import InputManager from '../systems/InputManager';
import PhysicsAdapter, { PhysicsBody } from '../physics/PhysicsAdapter';
import SaveManager from '../systems/SaveManager';

export default class Player extends Phaser.GameObjects.Sprite {
  public input: InputManager;
  private physics: PhysicsAdapter;
  private bodyRef: PhysicsBody;
  private moveDir = new Phaser.Math.Vector2();
  private lookDir = new Phaser.Math.Vector2();
  private coyoteTime = 100;
  private coyoteTimer = 0;
  private jumpBuffer = 90;
  private jumpTimer = 0;
  private speed = 160;
  private jumpSpeed = 330;
  private hp = 100;
  private inventory: string[] = [];
  private maxJumps = 1;
  private jumpsRemaining = 1;
  private canGlide = false;
  private isGliding = false;
  private glideFallSpeed = 50;

  constructor(
    scene: Phaser.Scene,
    physics: PhysicsAdapter,
    x: number,
    y: number,
    _data?: Record<string, any>
  ) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    this.setOrigin(0.5, 28 / 32);
    this.physics = physics;
    this.bodyRef = this.physics.createBody('dynamic', {
      gameObject: this,
      width: 20,
      height: 28,
      offsetX: 6,
      offsetY: 4
    });
    this.input = new InputManager(scene);
    this.input.on('move', (v: Phaser.Math.Vector2) => {
      this.moveDir.copy(v);
    });
    this.input.on('look', (v: Phaser.Math.Vector2) => {
      this.lookDir.copy(v);
      this.updateCameraLook();
    });
    this.input.on('jump', () => {
      this.jumpTimer = this.jumpBuffer;
    });
    this.input.on('drop', () => {
      this.tryDropThrough();
    });
    this.input.on('dash', () => {
      // hook for dash action
    });

    const snap = SaveManager.getSnapshot();
    if (
      SaveManager.getFlag('double_jump') ||
      snap.player.inventory.includes('double_jump')
    ) {
      this.maxJumps = 2;
    }
    if (SaveManager.getFlag('glide') || snap.player.inventory.includes('glide')) {
      this.canGlide = true;
    }
    this.jumpsRemaining = this.maxJumps;
  }

  private tryDropThrough() {
    const body = this.bodyRef.raw as Phaser.Physics.Arcade.Body;
    if (body.blocked.down) {
      body.checkCollision.down = false;
      this.physics.setVelocity(this.bodyRef, body.velocity.x, 100);
      this.scene.time.delayedCall(250, () => {
        body.checkCollision.down = true;
      });
    }
  }

  private updateCameraLook() {
    const cam = this.scene.cameras.main;
    const body = this.bodyRef.raw as Phaser.Physics.Arcade.Body;
    if (body.blocked.down && Math.abs(this.moveDir.x) < 0.01) {
      if (this.lookDir.y < -0.5) {
        cam.setFollowOffset(0, -50);
      } else if (this.lookDir.y > 0.5) {
        cam.setFollowOffset(0, 50);
      } else {
        cam.setFollowOffset(0, 0);
      }
    } else {
      cam.setFollowOffset(0, 0);
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    const body = this.bodyRef.raw as Phaser.Physics.Arcade.Body;

    this.physics.setVelocity(this.bodyRef, this.moveDir.x * this.speed, body.velocity.y);

    if (body.blocked.down) {
      this.coyoteTimer = this.coyoteTime;
      this.jumpsRemaining = this.maxJumps;
    } else if (this.coyoteTimer > 0) {
      this.coyoteTimer -= delta;
    }

    if (this.jumpTimer > 0) {
      this.jumpTimer -= delta;
    }

    if (this.jumpTimer > 0 && this.jumpsRemaining > 0) {
      this.physics.setVelocity(this.bodyRef, body.velocity.x, -this.jumpSpeed);
      this.jumpTimer = 0;
      this.coyoteTimer = 0;
      this.jumpsRemaining--;
    }

    const wasGliding = this.isGliding;
    if (!body.blocked.down && body.velocity.y > 0 && this.canGlide && this.input.jumpPressed) {
      this.physics.setVelocity(this.bodyRef, body.velocity.x, this.glideFallSpeed);
      this.isGliding = true;
    } else {
      this.isGliding = false;
    }
    if (wasGliding !== this.isGliding) {
      // hook for glide animation/state change
    }
  }

  getSnapshot() {
    return {
      x: this.x,
      y: this.y,
      hp: this.hp,
      inventory: [...this.inventory],
      maxJumps: this.maxJumps
    };
  }

  restore(snapshot: {
    x: number;
    y: number;
    hp: number;
    inventory: string[];
    maxJumps?: number;
  }) {
    this.setPosition(snapshot.x, snapshot.y);
    this.hp = snapshot.hp;
    this.inventory = [...snapshot.inventory];
    if (snapshot.maxJumps !== undefined) {
      this.maxJumps = snapshot.maxJumps;
    } else if (
      SaveManager.getFlag('double_jump') ||
      snapshot.inventory.includes('double_jump')
    ) {
      this.maxJumps = 2;
    } else {
      this.maxJumps = 1;
    }
    this.canGlide = SaveManager.getFlag('glide') || this.inventory.includes('glide');
    this.jumpsRemaining = this.maxJumps;
  }

  public obtain(item: string) {
    if (!this.inventory.includes(item)) {
      this.inventory.push(item);
    }
    if (item === 'double_jump') {
      this.maxJumps = 2;
      this.jumpsRemaining = this.maxJumps;
    } else if (item === 'glide') {
      this.canGlide = true;
    }
  }
}
