import { mustExist } from '@apextoaster/js-utils';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { RenderService } from '.';
import { INJECT_LOCALE, INJECT_LOGGER, INJECT_STATE } from '../../module';
import { LocaleService } from '../locale';
import { StateService, StepResult } from '../state';

export interface BaseRenderOptions extends BaseOptions {
  [INJECT_LOCALE]?: LocaleService;
  [INJECT_LOGGER]?: Logger;
  [INJECT_STATE]?: StateService;
}

@Inject(INJECT_LOCALE, INJECT_LOGGER, INJECT_STATE)
export abstract class BaseRender implements RenderService {
  // services
  protected logger: Logger;
  protected locale: LocaleService;
  protected state: StateService;

  // state
  protected step: StepResult;

  constructor(options: BaseRenderOptions) {
    this.locale = mustExist(options[INJECT_LOCALE]);
    this.logger = mustExist(options[INJECT_LOGGER]);
    this.state = mustExist(options[INJECT_STATE]);

    this.step = {
      stop: false,
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
