import Phaser from 'phaser';
import { Story } from 'inkjs';
import DialogueBox from '../ui/DialogueBox';

export default class VisualNovel extends Phaser.Scene {
  private story!: Story;
  private dialogue!: DialogueBox;

  constructor() {
    super('VisualNovel');
  }

  create() {
    const data = this.cache.json.get('inkTest');
    this.story = new Story(data);

    this.dialogue = new DialogueBox(this);
    this.dialogue.onNext(() => {
      if (this.story.currentChoices.length === 0) {
        this.advance();
      }
    });

    this.input.keyboard.on('keydown-V', () => this.scene.start('Play'));

    this.advance();
  }

  private advance() {
    this.dialogue.clearChoices();

    if (this.story.canContinue) {
      const line = this.story.Continue().trim();
      this.dialogue.setText(line);
    } else if (this.story.currentChoices.length > 0) {
      const choices = this.story.currentChoices.map((c) => c.text);
      this.dialogue.setChoices(choices, (index) => {
        this.story.ChooseChoiceIndex(index);
        this.advance();
      });
    } else {
      this.dialogue.setText('The End. Press V to return.');
    }
  }
}

