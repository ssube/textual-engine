import { constructorName, InvalidArgumentError, mustExist } from '@apextoaster/js-utils';
import { Inject, Logger } from 'noicejs';
import { stdin, stdout } from 'process';
import { createInterface, Interface as LineInterface } from 'readline';

import { RenderService } from '.';
import { INJECT_EVENT, INJECT_LOCALE, INJECT_LOGGER } from '../../module';
import { EVENT_ACTOR_OUTPUT, EVENT_RENDER_OUTPUT, EVENT_STATE_ROOM, META_QUIT } from '../../util/constants';
import { onceEvent } from '../../util/async/event';
import { EventBus, LineEvent, RoomEvent } from '../event';
import { LocaleService } from '../locale';
import { StepResult } from '../state';
import { BaseRenderOptions } from './react/BaseRender';

@Inject(/* all from base */)
export class LineRender implements RenderService {
  // services
  protected event: EventBus;
  protected logger: Logger;
  protected locale: LocaleService;
  protected step: StepResult;

  // next-line flags
  protected padPrompt: boolean;
  protected skipLine: boolean;

  protected reader?: LineInterface;

  constructor(options: BaseRenderOptions) {
    this.event = mustExist(options[INJECT_EVENT]);
    this.locale = mustExist(options[INJECT_LOCALE]);
    this.logger = mustExist(options[INJECT_LOGGER]).child({
      kind: constructorName(this),
    });

    this.step = {
      turn: 0,
      time: 0,
    };

    this.padPrompt = false;
    this.skipLine = false;
  }

  public async read(): Promise<string> {
    const reader = mustExist(this.reader);

    const pending = onceEvent<string>(reader, 'line');

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
      this.event.emit(EVENT_RENDER_OUTPUT, {
        lines: [line],
      });
    });

    this.reader.on('SIGINT', () => {
      this.logger.debug('sending interrupt as quit command');
      this.event.emit(EVENT_RENDER_OUTPUT, {
        lines: [META_QUIT],
      });
    });

    this.event.on(EVENT_ACTOR_OUTPUT, (output) => this.onOutput(output));
    this.event.on(EVENT_STATE_ROOM, (room) => this.onRoom(room));

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
