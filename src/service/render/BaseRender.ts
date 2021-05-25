import { constructorName, mustExist } from '@apextoaster/js-utils';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { RenderService } from '.';
import { INJECT_ACTOR_PLAYER, INJECT_LOCALE, INJECT_LOGGER, INJECT_STATE } from '../../module';
import { ActorService } from '../actor';
import { LocaleService } from '../locale';
import { StepResult } from '../state';

export interface BaseRenderOptions extends BaseOptions {
  [INJECT_ACTOR_PLAYER]?: ActorService;
  [INJECT_LOCALE]?: LocaleService;
  [INJECT_LOGGER]?: Logger;
}

@Inject(INJECT_LOCALE, INJECT_LOGGER, INJECT_STATE)
export abstract class BaseRender implements RenderService {
  // services
  protected logger: Logger;
  protected locale: LocaleService;
  protected player: ActorService;

  // state
  protected step: StepResult;

  constructor(options: BaseRenderOptions) {
    this.locale = mustExist(options[INJECT_LOCALE]);
    this.logger = mustExist(options[INJECT_LOGGER]).child({
      kind: constructorName(this),
    });
    this.player = mustExist(options[INJECT_ACTOR_PLAYER]);

    this.step = {
      turn: 0,
      time: 0,
    };
  }

  abstract prompt(prompt: string): void;
  abstract read(): Promise<string>;
  abstract show(line: string): Promise<void>;
  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
}
