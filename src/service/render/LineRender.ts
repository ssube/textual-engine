import { InvalidArgumentError, mustExist } from '@apextoaster/js-utils';
import { Inject } from 'noicejs';
import { stdin, stdout } from 'process';
import { createInterface, Interface as LineInterface } from 'readline';

import { RenderService } from '.';
import { META_QUIT } from '../../util/constants';
import { onceWithRemove } from '../../util/event';
import { StepResult } from '../state';
import { BaseRender, BaseRenderOptions } from './BaseRender';

@Inject(/* all from base */)
export class LineRender extends BaseRender implements RenderService {
  protected reader?: LineInterface;

  // next-line flags
  protected padPrompt: boolean;
  protected skipLine: boolean;

  // eslint-disable-next-line no-useless-constructor
  constructor(options: BaseRenderOptions) {
    super(options);

    this.padPrompt = false;
    this.skipLine = false;
  }

  public async read(): Promise<string> {
    const reader = mustExist(this.reader);

    const { pending } = onceWithRemove<string>(reader, 'line');

    reader.prompt();

    return pending;
  }

  public prompt(prompt: string): void {
    mustExist(this.reader).setPrompt(prompt);
  }

  public async show(msg: string): Promise<void> {
    this.showSync(msg);
  }

  public async start(): Promise<void> {
    this.reader = createInterface({
      input: stdin,
      output: stdout,
      prompt: '',
    });

    this.reader.on('line', (line) => {
      if (this.skipLine) {
        this.skipLine = false;
        return;
      }

      this.padPrompt = false;

      this.logger.debug({ line }, 'read line');
      this.state.emit('line', line);
    });

    this.reader.on('SIGINT', () => {
      this.logger.debug('sending interrupt as quit command');
      this.state.emit('line', META_QUIT);
    });

    this.state.on('output', (output) => this.onOutput(output));
    this.state.on('step', (step) => this.onStep(step));

    this.showPrompt();
  }

  public async stop(): Promise<void> {
    mustExist(this.reader).close();
  }

  /**
   * Handler for output line events received from state service.
   */
  public onOutput(lines: Array<string>): void {
    if (!Array.isArray(lines)) {
      throw new InvalidArgumentError('please batch output');
    }

    this.logger.debug({ lines }, 'handling output event from state');

    if (this.padPrompt) {
      // a prompt was being shown, move to a newline before output
      this.showSync('');
    }

    for (const line of lines) {
      this.showSync(line);
    }

    this.showPrompt();
  }

  public onStep(result: StepResult): void {
    this.logger.debug(result, 'handling step event from state');
    this.step = result;
    this.showPrompt();
  }

  protected showSync(msg: string): void {
    this.skipLine = true;

    const reader = mustExist(this.reader);
    reader.write(msg);
    reader.write('\n');
  }

  protected showPrompt(): void {
    this.padPrompt = true;

    const reader = mustExist(this.reader);
    reader.setPrompt(`turn ${this.step.turn} > `);
    reader.prompt();
  }
}
