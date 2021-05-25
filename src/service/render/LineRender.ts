import { InvalidArgumentError, mustExist } from '@apextoaster/js-utils';
import { Inject } from 'noicejs';
import { stdin, stdout } from 'process';
import { createInterface, Interface as LineInterface } from 'readline';

import { RenderService } from '.';
import { META_QUIT } from '../../util/constants';
import { onceWithRemove } from '../../util/event';
import { LineEvent, RoomEvent } from '../event';
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
      this.event.emit('render-output', {
        lines: [line],
      });
    });

    this.reader.on('SIGINT', () => {
      this.logger.debug('sending interrupt as quit command');
      this.event.emit('render-output', {
        lines: [META_QUIT],
      });
    });

    this.event.on('actor-output', (output) => this.onOutput(output));
    this.event.on('state-room', (room) => this.onRoom(room));

    this.showPrompt();
  }

  public async stop(): Promise<void> {
    mustExist(this.reader).close();
  }

  /**
   * Handler for output line events received from state service.
   */
  public onOutput(event: LineEvent): void {
    this.logger.debug({ event }, 'handling output event from state');

    if (!Array.isArray(event.lines)) {
      throw new InvalidArgumentError('please batch output');
    }

    if (this.padPrompt) {
      // a prompt was being shown, move to a newline before output
      this.showSync('');
    }

    for (const line of event.lines) {
      this.showSync(line);
    }

    this.showPrompt();
  }

  public onRoom(event: RoomEvent): void {
    this.logger.debug({ event }, 'handling step event from state');
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
