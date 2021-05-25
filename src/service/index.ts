import { BaseOptions, Logger } from 'noicejs';

import { INJECT_LOCALE, INJECT_LOGGER, INJECT_STATE } from '../module';
import { LocaleService } from './locale';
import { StateService } from './state';

export interface ServiceOptions extends BaseOptions {
  [INJECT_LOCALE]?: LocaleService;
  [INJECT_LOGGER]?: Logger;
  [INJECT_STATE]?: StateService;
}

export interface Service {
  start(): Promise<void>;
  stop(): Promise<void>;
}
