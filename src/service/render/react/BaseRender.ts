import { constructorName, InvalidArgumentError, mustExist } from '@apextoaster/js-utils';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { RenderService } from '..';
import { INJECT_EVENT, INJECT_LOCALE, INJECT_LOGGER } from '../../../module';
import { debounce } from '../../../util/async/Debounce';
import { onceEvent } from '../../../util/async/event';
import { EVENT_ACTOR_OUTPUT, EVENT_COMMON_QUIT, EVENT_STATE_ROOM, EVENT_STATE_STEP } from '../../../util/constants';
import { EventBus, LineEvent } from '../../event';
import { LocaleService } from '../../locale';
import { StepResult } from '../../state';
import { StateRoomEvent } from '../../state/events';

export interface BaseRenderOptions extends BaseOptions {
  [INJECT_EVENT]?: EventBus;
  [INJECT_LOCALE]?: LocaleService;
  [INJECT_LOGGER]?: Logger;
}

@Inject(INJECT_EVENT, INJECT_LOCALE, INJECT_LOGGER)
export abstract class BaseReactRender implements RenderService {
  // services
  protected event: EventBus;
  protected logger: Logger;
  protected locale: LocaleService;

  // state
  protected input: string;
  protected output: Array<string>;
  protected prompt: string;
  protected quit: boolean;
  protected step: StepResult;

  protected derender: () => void;

  constructor(options: BaseRenderOptions) {
    this.event = mustExist(options[INJECT_EVENT]);
    this.locale = mustExist(options[INJECT_LOCALE]);
    this.logger = mustExist(options[INJECT_LOGGER]).child({
      kind: constructorName(this),
    });

    this.derender = debounce(100, () => this.renderRoot());

    this.input = '';
    this.output = [];
    this.prompt = '';
    this.quit = false;
    this.step = {
      turn: 0,
      time: 0,
    };
  }

  public async start(): Promise<void> {
    this.renderRoot();
    this.setPrompt(`turn ${this.step.turn}`);

    this.event.on(EVENT_ACTOR_OUTPUT, (output) => this.onOutput(output), this);
    this.event.on(EVENT_COMMON_QUIT, () => this.onQuit(), this);
    this.event.on(EVENT_STATE_ROOM, (room) => this.onRoom(room), this);
    this.event.on(EVENT_STATE_STEP, (step) => this.onStep(step), this);
  }

  public async stop(): Promise<void> {
    this.event.removeGroup(this);
  }

  protected abstract renderRoot(): void;

  public setPrompt(prompt: string): void {
    this.prompt = prompt;
  }

  public async read(): Promise<string> {
    const event = await onceEvent<LineEvent>(this.event, EVENT_ACTOR_OUTPUT);
    return event.lines[0];
  }

  public async show(msg: string): Promise<void> {
    this.output.push(msg);
  }

  /**
   * Handler for output line events received from state service.
   */
  public onOutput(event: LineEvent): void {
    this.logger.debug({ event }, 'handling output event from state');

    if (!Array.isArray(event.lines)) {
      throw new InvalidArgumentError('please batch output');
    }

    this.output.push(...event.lines);
    this.renderRoot();
  }

  /**
   * Handler for quit events received from state service.
   */
  public onQuit(): void {
    this.logger.debug('handling quit event from state');
    this.quit = true;
    this.renderRoot();
  }

  /**
   * Handler for step events received from state service.
   */
  public onRoom(result: StateRoomEvent): void {
    this.logger.debug(result, 'handling room event from state');

    this.setPrompt(`turn ${this.step.turn}`);
    this.renderRoot();
  }

  public onStep(event: StepResult): void {
    this.logger.debug({ event }, 'handling step event from state');

    this.step = event;
    this.setPrompt(`turn ${this.step.turn}`);
    this.renderRoot();
  }
}
