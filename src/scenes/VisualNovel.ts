import Phaser from 'phaser';
import DialogueBox from '../ui/DialogueBox';

export default class VisualNovel extends Phaser.Scene {
  private story?: any;
  private dialogue?: DialogueBox;
  private errorText?: Phaser.GameObjects.Text;

  constructor() {
    super('VisualNovel');
  }

  create() {
    this.input.keyboard.on('keydown-V', () => this.scene.start('Play'));
    this.input.keyboard.on('keydown-R', () => this.loadStory());

    this.loadStory();
  }

  private async loadStory() {
    this.story = undefined;
    this.dialogue?.destroy();
    this.dialogue = undefined;
    this.errorText?.destroy();
    this.errorText = undefined;

    try {
      const ink = await import('inkjs');
      const res = await fetch('/assets/dialogue/sample.ink.json');
      if (!res.ok) {
        throw new Error('Failed to load file');
      }

      const data = await res.json();
      if (data && typeof data === 'object' && 'inkVersion' in data) {
        this.story = new ink.Story(data);

        this.dialogue = new DialogueBox(this);
        this.dialogue.onNext(() => {
          if (this.story && this.story.currentChoices.length === 0) {
            this.advance();
          }
        });

        this.advance();
        return;
      }

      throw new Error('Invalid Ink data');
    } catch (err) {
      this.errorText = this.add
        .text(this.scale.width / 2, this.scale.height / 2, 'Dialogue not available', {
          color: '#ffffff',
          fontSize: '24px',
          backgroundColor: '#000000',
          padding: { x: 10, y: 10 }
        })
        .setOrigin(0.5);
    }
  }

  private advance() {
    if (!this.story || !this.dialogue) {
      return;
    }

    this.dialogue.clearChoices();

    if (this.story.canContinue) {
      const line = this.story.Continue().trim();
      this.dialogue.setText(line);
    } else if (this.story.currentChoices.length > 0) {
      const choices = this.story.currentChoices.map((c: any) => c.text);
      this.dialogue.setChoices(choices, (index) => {
        this.story.ChooseChoiceIndex(index);
        this.advance();
      });
    } else {
      this.dialogue.setText('The End. Press V to return.');
    }
  }
}

