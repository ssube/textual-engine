import { BaseOptions, Logger } from 'noicejs';

import { ConfigFile } from '../model/file/Config';
import { Counter } from '../service/counter';
import { EventBus } from '../service/event';
import { LocaleService } from '../service/locale';
import { Parser } from '../service/parser';
import { RandomService } from '../service/random';
import { ScriptService } from '../service/script';
import { TemplateService } from '../service/template';
import { TokenizerService } from '../service/tokenizer';

// service symbols
export const INJECT_CONFIG = Symbol('inject-config');
export const INJECT_COUNTER = Symbol('inject-counter');
export const INJECT_EVENT = Symbol('inject-event');
export const INJECT_LOCALE = Symbol('inject-locale');
export const INJECT_LOGGER = Symbol('inject-logger');
export const INJECT_PARSER = Symbol('inject-parser');
export const INJECT_RANDOM = Symbol('inject-random');
export const INJECT_SCRIPT = Symbol('inject-script');
export const INJECT_TEMPLATE = Symbol('inject-template');
export const INJECT_TOKENIZER = Symbol('inject-tokenizer');

export interface InjectedOptions extends BaseOptions {
  [INJECT_CONFIG]?: ConfigFile;
  [INJECT_COUNTER]?: Counter;
  [INJECT_EVENT]?: EventBus;
  [INJECT_LOCALE]?: LocaleService;
  [INJECT_LOGGER]?: Logger;
  [INJECT_PARSER]?: Parser;
  [INJECT_RANDOM]?: RandomService;
  [INJECT_SCRIPT]?: ScriptService;
  [INJECT_TEMPLATE]?: TemplateService;
  [INJECT_TOKENIZER]?: TokenizerService;

  config?: unknown;
}
