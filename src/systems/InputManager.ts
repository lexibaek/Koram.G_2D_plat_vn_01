import Phaser from 'phaser';

export default class InputManager {
  private scene: Phaser.Scene;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: { [key: string]: Phaser.Input.Keyboard.Key };
  private jumpKey: Phaser.Input.Keyboard.Key;
  private interactKey: Phaser.Input.Keyboard.Key;

  private joystickBase: Phaser.GameObjects.Arc;
  private joystickThumb: Phaser.GameObjects.Arc;
  private joystickPointerId?: number;
  private joystickDir = new Phaser.Math.Vector2(0, 0);

  private jumpButton: Phaser.GameObjects.Arc;
  private interactButton: Phaser.GameObjects.Arc;
  private jumpPressed = false;
  private interactPressed = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys('W,A,S,D') as any;
    this.jumpKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.interactKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

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
      this.jumpPressed = false;
      this.interactPressed = false;
    });

    const btnR = 32;
    const jx = 80;
    const jy = scene.scale.height - 80;
    this.jumpButton = scene.add.circle(jx, jy, btnR, 0x888888, 0.3).setScrollFactor(0).setInteractive();
    this.jumpButton.on('pointerdown', () => (this.jumpPressed = true));

    const ix = 80;
    const iy = scene.scale.height - 160;
    this.interactButton = scene.add.circle(ix, iy, btnR, 0x888888, 0.3).setScrollFactor(0).setInteractive();
    this.interactButton.on('pointerdown', () => (this.interactPressed = true));
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

  get up() {
    return (
      this.cursors.up.isDown ||
      (this.wasd.W && this.wasd.W.isDown) ||
      this.joystickDir.y < -0.3
    );
  }

  get down() {
    return (
      this.cursors.down.isDown ||
      (this.wasd.S && this.wasd.S.isDown) ||
      this.joystickDir.y > 0.3
    );
  }

  get jump() {
    return this.jumpKey.isDown || this.jumpPressed;
  }

  get interact() {
    return this.interactKey.isDown || this.interactPressed;
  }
}
