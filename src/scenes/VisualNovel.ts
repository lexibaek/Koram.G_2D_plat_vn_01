import Phaser from 'phaser';
import { Story } from 'inkjs';

export default class VisualNovel extends Phaser.Scene {
  private story!: Story;
  private text!: Phaser.GameObjects.Text;
  private choiceTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('VisualNovel');
  }

  create() {
    const data = this.cache.json.get('inkTest');
    this.story = new Story(data);

    this.text = this.add.text(20, 20, '', {
      wordWrap: { width: this.scale.width - 40 },
      color: '#ffffff',
      fontSize: '18px'
    });
    this.text.setScrollFactor(0);

    this.input.on('pointerdown', () => this.advance());
    this.input.keyboard.on('keydown-SPACE', () => this.advance());
    this.input.keyboard.on('keydown-V', () => this.scene.start('Play'));

    this.advance();
  }

  private clearChoices() {
    this.choiceTexts.forEach((c) => c.destroy());
    this.choiceTexts = [];
  }

  private advance() {
    this.clearChoices();
    if (this.story.canContinue) {
      const line = this.story.Continue().trim();
      this.text.setText(line);
    } else if (this.story.currentChoices.length > 0) {
      this.story.currentChoices.forEach((choice, index) => {
        const txt = this.add
          .text(20, 100 + index * 30, choice.text, {
            color: '#00ff00',
            fontSize: '16px'
          })
          .setInteractive();
        txt.on('pointerdown', () => {
          this.story.ChooseChoiceIndex(index);
          this.advance();
        });
        this.choiceTexts.push(txt);
      });
    } else if (this.choiceTexts.length === 0) {
      // Fallback placeholder choices when story has none
      ['Choice A', 'Choice B'].forEach((text, index) => {
        const txt = this.add
          .text(20, 100 + index * 30, text, {
            color: '#00ff00',
            fontSize: '16px'
          })
          .setInteractive();
        txt.on('pointerdown', () => {
          this.text.setText(`You selected: ${text}`);
          this.clearChoices();
        });
        this.choiceTexts.push(txt);
      });
    } else {
      this.text.setText('The End. Press V to return.');
    }
  }
}
