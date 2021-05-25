import { constructorName, mustExist } from '@apextoaster/js-utils';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { RenderService } from '.';
import { INJECT_EVENT, INJECT_LOCALE, INJECT_LOGGER } from '../../module';
import { EventBus } from '../event';
import { LocaleService } from '../locale';
import { StepResult } from '../state';

export interface BaseRenderOptions extends BaseOptions {
  [INJECT_EVENT]?: EventBus;
  [INJECT_LOCALE]?: LocaleService;
  [INJECT_LOGGER]?: Logger;
}

@Inject(INJECT_EVENT, INJECT_LOCALE, INJECT_LOGGER)
export abstract class BaseRender implements RenderService {
  // services
  protected event: EventBus;
  protected logger: Logger;
  protected locale: LocaleService;

  // state
  protected step: StepResult;

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
  }

  abstract prompt(prompt: string): void;
  abstract read(): Promise<string>;
  abstract show(line: string): Promise<void>;
  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
}
