import Phaser from 'phaser';

export default class DialogueBox extends Phaser.GameObjects.Container {
  private text: Phaser.GameObjects.Text;
  private portrait: Phaser.GameObjects.Rectangle;
  private choiceButtons: Phaser.GameObjects.Text[] = [];
  private background: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, scene.scale.height - 150);
    scene.add.existing(this);

    this.background = scene.add
      .rectangle(0, 0, scene.scale.width, 150, 0x000000, 0.7)
      .setOrigin(0)
      .setInteractive();
    this.add(this.background);

    this.portrait = scene.add
      .rectangle(10, 10, 80, 80, 0x666666)
      .setOrigin(0);
    this.add(this.portrait);

    this.text = scene.add
      .text(100, 10, '', {
        color: '#ffffff',
        fontSize: '18px',
        wordWrap: { width: scene.scale.width - 110 }
      })
      .setOrigin(0);
    this.add(this.text);
  }

  setText(value: string) {
    this.text.setText(value);
  }

  clearChoices() {
    this.choiceButtons.forEach((c) => c.destroy());
    this.choiceButtons = [];
  }

  setChoices(choices: string[], onSelect: (index: number) => void) {
    this.clearChoices();
    choices.forEach((choice, index) => {
      const btn = this.scene.add
        .text(100, 60 + index * 30, choice, {
          color: '#00ff00',
          fontSize: '16px'
        })
        .setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => onSelect(index));
      this.add(btn);
      this.choiceButtons.push(btn);
    });
  }

  onNext(callback: () => void) {
    this.background.on('pointerdown', callback);
  }
}

