import { constructorName, InvalidArgumentError, mustExist } from '@apextoaster/js-utils';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { RenderService } from '.';
import { INJECT_EVENT, INJECT_LOCALE, INJECT_LOGGER } from '../../module';
import { onceWithRemove } from '../../util/event';
import { EventBus, LineEvent, OutputEvent, RoomEvent } from '../event';
import { LocaleService } from '../locale';
import { StepResult } from '../state';

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
  protected inputStr: string;
  protected promptStr: string;
  protected output: Array<string>;
  protected step: StepResult;

  constructor(options: BaseRenderOptions) {
    this.event = mustExist(options[INJECT_EVENT]);
    this.locale = mustExist(options[INJECT_LOCALE]);
    this.logger = mustExist(options[INJECT_LOGGER]).child({
      kind: constructorName(this),
    });

    this.inputStr = '';
    this.promptStr = '';
    this.output = [];
    this.step = {
      turn: 0,
      time: 0,
    };
  }

  public abstract start(): Promise<void>;
  public abstract stop(): Promise<void>;
  protected abstract renderRoot(): void;

  public prompt(prompt: string): void {
    this.promptStr = prompt;
  }

  public async read(): Promise<string> {
    const { pending } = onceWithRemove<OutputEvent>(this.event, 'actor-output');
    const event = await pending;

    return event.lines[0].key;
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

    // this.renderRoot();
  }

  /**
   * Handler for quit events received from state service.
   */
  public onQuit(): void {
    this.logger.debug('handling quit event from state');
    this.output.push('game over');
  }

  /**
   * Handler for step events received from state service.
   */
  public onRoom(result: RoomEvent): void {
    this.logger.debug(result, 'handling room event from state');

    this.prompt(`turn ${this.step.turn}`);
    this.renderRoot();
  }

  public onStep(event: StepResult): void {
    this.logger.debug({ event }, 'handling step event from state');

    this.step = event;
    this.renderRoot();
  }
}
