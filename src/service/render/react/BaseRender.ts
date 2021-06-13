import { mustExist } from '@apextoaster/js-utils';
import { Inject, Logger } from 'noicejs';

import { RenderService } from '..';
import { ShortcutData, ShortcutItem } from '../../../component/shared';
import { Entity } from '../../../model/entity/Base';
import { INJECT_EVENT, INJECT_LOCALE, INJECT_LOGGER, InjectedOptions } from '../../../module';
import { debounce } from '../../../util/async/Debounce';
import { onceEvent } from '../../../util/async/event';
import {
  EVENT_ACTOR_OUTPUT,
  EVENT_ACTOR_ROOM,
  EVENT_COMMON_QUIT,
  EVENT_RENDER_OUTPUT,
  EVENT_STATE_STEP,
  RENDER_DELAY,
} from '../../../util/constants';
import { getVerbScripts } from '../../../util/script';
import { makeServiceLogger } from '../../../util/service';
import { ActorOutputEvent, ActorRoomEvent } from '../../actor/events';
import { EventBus } from '../../event';
import { LocaleService } from '../../locale';
import { StepResult } from '../../state';
import { StateStepEvent } from '../../state/events';

export interface BaseRenderConfig {
  shortcuts: boolean;
}

@Inject(INJECT_EVENT, INJECT_LOCALE, INJECT_LOGGER)
export abstract class BaseReactRender implements RenderService {
  // services
  protected config: BaseRenderConfig;
  protected event: EventBus;
  protected logger: Logger;
  protected locale: LocaleService;

  // state
  protected input: string;
  protected output: Array<string>;
  protected prompt: string;
  protected quit: boolean;
  protected shortcuts: ShortcutData;
  protected step: StepResult;

  protected slowUpdate: () => void;

  public abstract update(): void;

  constructor(options: InjectedOptions) {
    this.config = mustExist(options.config) as BaseRenderConfig;
    this.event = mustExist(options[INJECT_EVENT]);
    this.locale = mustExist(options[INJECT_LOCALE]);
    this.logger = makeServiceLogger(options[INJECT_LOGGER], this);

    this.slowUpdate = debounce(RENDER_DELAY, () => this.update());

    this.input = '';
    this.output = [];
    this.prompt = '';
    this.quit = false;
    this.shortcuts = {
      actors: [],
      items: [],
      portals: [],
      verbs: [],
    };
    this.step = {
      turn: 0,
      time: 0,
    };
  }

  public async start(): Promise<void> {
    this.setPrompt(`turn ${this.step.turn}`);
    this.update();

    this.event.on(EVENT_ACTOR_OUTPUT, (output) => this.onOutput(output), this);
    this.event.on(EVENT_ACTOR_ROOM, (room) => this.onRoom(room), this);
    this.event.on(EVENT_COMMON_QUIT, () => this.onQuit(), this);
    this.event.on(EVENT_STATE_STEP, (step) => this.onStep(step), this);
  }

  public async stop(): Promise<void> {
    this.event.removeGroup(this);
  }

  public setPrompt(prompt: string): void {
    this.prompt = prompt;
  }

  public async read(): Promise<string> {
    const event = await onceEvent<ActorOutputEvent>(this.event, EVENT_RENDER_OUTPUT);
    return event.line;
  }

  public async show(msg: string): Promise<void> {
    this.output.push(msg);
  }

  /**
   * Handler for output line events received from actor service.
   */
  public onOutput(event: ActorOutputEvent): void {
    this.logger.debug({ event }, 'handling output event from actor');
    this.output.push(event.line);
    this.slowUpdate();
  }

  /**
   * Handler for quit events received from state service.
   */
  public onQuit(): void {
    this.logger.debug('handling quit event from state');
    this.quit = true;
    this.update();
  }

  /**
   * Handler for step events received from state service.
   */
  public onRoom(result: ActorRoomEvent): void {
    this.logger.debug(result, 'handling room event from state');

    function extractShortcut(entity: Entity): ShortcutItem {
      return {
        id: entity.meta.id,
        name: entity.meta.name,
      };
    }

    this.shortcuts.actors = result.room.actors.filter((it) => it.meta.id !== result.pid).map(extractShortcut);
    this.shortcuts.items = result.room.items.map(extractShortcut);
    this.shortcuts.portals = result.room.portals.map((it) => ({
      id: `${it.sourceGroup} ${it.name}`,
      name: `${it.sourceGroup} ${it.name}`,
    }));
    this.shortcuts.verbs = Array.from(getVerbScripts(result).keys()).map((it) => ({
      id: it,
      name: it,
    }));

    this.setPrompt(`turn ${this.step.turn}`);
    this.slowUpdate();
  }

  public onStep(event: StateStepEvent): void {
    this.logger.debug({ event }, 'handling step event from state');

    this.step = event.step;
    this.setPrompt(`turn ${this.step.turn}`);
    this.update();
  }

  /**
   * Handler for lines received from the React tree.
   */
  public nextLine(line: string): void {
    this.logger.debug({ line }, 'handling line event from React');

    // update inner state
    this.input = line;

    // append to buffer
    this.output.push(`${this.prompt} > ${this.input}`);

    if (line.length > 0) {
      // forward event to state
      this.event.emit(EVENT_RENDER_OUTPUT, {
        line,
      });
    }
  }
}
