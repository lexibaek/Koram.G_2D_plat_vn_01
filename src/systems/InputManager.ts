import Phaser from 'phaser';

export default class InputManager extends Phaser.Events.EventEmitter {
  private scene: Phaser.Scene;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: { [key: string]: Phaser.Input.Keyboard.Key };
  private jumpKey: Phaser.Input.Keyboard.Key;
  private interactKey: Phaser.Input.Keyboard.Key;
  private dashKey: Phaser.Input.Keyboard.Key;

  private joystickBase: Phaser.GameObjects.Arc;
  private joystickThumb: Phaser.GameObjects.Arc;
  private joystickPointerId?: number;
  private joystickDir = new Phaser.Math.Vector2(0, 0);

  private jumpButton: Phaser.GameObjects.Arc;
  private interactButton: Phaser.GameObjects.Arc;
  private dashButton: Phaser.GameObjects.Arc;
  private jumpButtonDown = false;
  private interactButtonDown = false;
  private dashButtonDown = false;

  private dropThroughFlag = false;
  private dropComboPrev = false;

  private prevMove = new Phaser.Math.Vector2();
  private prevLook = new Phaser.Math.Vector2();
  private prevJump = false;
  private prevDash = false;

  constructor(scene: Phaser.Scene) {
    super();
    this.scene = scene;

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys('W,A,S,D') as any;
    this.jumpKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.interactKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.dashKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    const radius = 40;
    const x = scene.scale.width - 80;
    const y = scene.scale.height - 80;
    this.joystickBase = scene.add.circle(x, y, radius, 0x888888, 0.3).setScrollFactor(0).setInteractive();
    this.joystickThumb = scene.add.circle(x, y, radius / 2, 0xcccccc, 0.5).setScrollFactor(0);
    this.joystickBase.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.joystickPointerId = p.id;
      this.updateJoystick(p);
    });
    scene.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.id === this.joystickPointerId) this.updateJoystick(p);
    });
    scene.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      if (p.id === this.joystickPointerId) {
        this.joystickPointerId = undefined;
        this.joystickDir.set(0, 0);
        this.joystickThumb.setPosition(x, y);
      }
      this.jumpButtonDown = false;
      this.interactButtonDown = false;
      this.dashButtonDown = false;
    });

    const btnR = 32;
    const jx = 80;
    const jy = scene.scale.height - 80;
    this.jumpButton = scene
      .add.circle(jx, jy, btnR, 0x888888, 0.3)
      .setScrollFactor(0)
      .setInteractive();
    this.jumpButton.on('pointerdown', () => (this.jumpButtonDown = true));

    const ix = 80;
    const iy = scene.scale.height - 160;
    this.interactButton = scene
      .add.circle(ix, iy, btnR, 0x888888, 0.3)
      .setScrollFactor(0)
      .setInteractive();
    this.interactButton.on('pointerdown', () => (this.interactButtonDown = true));

    const dx = 160;
    const dy = scene.scale.height - 80;
    this.dashButton = scene
      .add.circle(dx, dy, btnR, 0x888888, 0.3)
      .setScrollFactor(0)
      .setInteractive();
    this.dashButton.on('pointerdown', () => (this.dashButtonDown = true));

    this.scene.events.on('update', this.handleUpdate, this);

    this.scene.time.addEvent({ delay: 500, loop: true, callback: this.logInputs, callbackScope: this });
  }

  private updateJoystick(p: Phaser.Input.Pointer) {
    const baseX = this.joystickBase.x;
    const baseY = this.joystickBase.y;
    const dx = p.x - baseX;
    const dy = p.y - baseY;
    const radius = this.joystickBase.radius as number;
    const dist = Math.min(radius, Math.sqrt(dx * dx + dy * dy));
    const ang = Math.atan2(dy, dx);
    this.joystickThumb.setPosition(baseX + Math.cos(ang) * dist, baseY + Math.sin(ang) * dist);
    this.joystickDir.set(dx, dy).normalize();
  }

  get left() {
    return (
      this.cursors.left.isDown ||
      (this.wasd.A && this.wasd.A.isDown) ||
      this.joystickDir.x < -0.3
    );
  }

  get right() {
    return (
      this.cursors.right.isDown ||
      (this.wasd.D && this.wasd.D.isDown) ||
      this.joystickDir.x > 0.3
    );
  }

  get lookUp() {
    return (
      this.cursors.up.isDown ||
      (this.wasd.W && this.wasd.W.isDown) ||
      this.joystickDir.y < -0.3
    );
  }

  get up() {
    return this.lookUp;
  }

  get down() {
    return (
      this.cursors.down.isDown ||
      (this.wasd.S && this.wasd.S.isDown) ||
      this.joystickDir.y > 0.3
    );
  }

  get move() {
    const x = Math.abs(this.joystickDir.x) > 0.3
      ? this.joystickDir.x
      : this.left ? -1 : this.right ? 1 : 0;
    const y = Math.abs(this.joystickDir.y) > 0.3
      ? this.joystickDir.y
      : this.up ? -1 : this.down ? 1 : 0;
    return new Phaser.Math.Vector2(x, y);
  }

  get look() {
    const y = Math.abs(this.joystickDir.y) > 0.3
      ? this.joystickDir.y
      : this.lookUp ? -1 : this.down ? 1 : 0;
    return new Phaser.Math.Vector2(0, y);
  }

  get jumpPressed() {
    return this.jumpKey.isDown || this.jumpButtonDown;
  }

  get dashPressed() {
    return this.dashKey.isDown || this.dashButtonDown;
  }

  get dropThrough() {
    return this.dropThroughFlag;
  }

  get interact() {
    return this.interactKey.isDown || this.interactButtonDown;
  }

  private handleUpdate() {
    const combo = this.down && this.jumpPressed;
    this.dropThroughFlag = combo && !this.dropComboPrev;
    this.dropComboPrev = combo;

    const move = this.move;
    if (!move.equals(this.prevMove)) {
      this.prevMove.copy(move);
      this.emit('move', move.clone());
    }

    const look = this.look;
    if (!look.equals(this.prevLook)) {
      this.prevLook.copy(look);
      this.emit('look', look.clone());
    }

    if (this.jumpPressed && !this.prevJump) {
      this.emit('jump');
    }
    this.prevJump = this.jumpPressed;

    if (this.dashPressed && !this.prevDash) {
      this.emit('dash');
    }
    this.prevDash = this.dashPressed;

    if (this.dropThroughFlag) {
      this.emit('drop');
    }
  }

  private logInputs() {
    const info = {
      move: { x: Number(this.move.x.toFixed(2)), y: Number(this.move.y.toFixed(2)) },
      look: { x: Number(this.look.x.toFixed(2)), y: Number(this.look.y.toFixed(2)) },
      jumpPressed: this.jumpPressed,
      dashPressed: this.dashPressed,
      interact: this.interact,
      dropThrough: this.dropThrough
    };
    if (
      info.move.x !== 0 ||
      info.move.y !== 0 ||
      info.look.x !== 0 ||
      info.look.y !== 0 ||
      info.jumpPressed ||
      info.dashPressed ||
      info.interact ||
      info.dropThrough
    ) {
      // eslint-disable-next-line no-console
      console.log('input', info);
    }
  }
}
