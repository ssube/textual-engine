import { mustExist } from '@apextoaster/js-utils';
import { Logger, Module, ModuleOptions, Provides } from 'noicejs';

import {
  INJECT_COUNTER,
  INJECT_LOCALE,
  INJECT_LOGGER,
  INJECT_PARSER,
  INJECT_RANDOM,
  INJECT_SCRIPT,
  INJECT_STATE,
  INJECT_TEMPLATE,
} from '.';
import { LocaleService } from '../service/locale';
import { NextLocaleService } from '../service/locale/NextLocaleService';
import { YamlParser } from '../service/parser/YamlParser';
import { RandomGenerator } from '../service/random';
import { SeedRandomGenerator } from '../service/random/SeedRandom';
import { ScriptService } from '../service/script';
import { LocalScriptService } from '../service/script/LocalScriptService';
import { StateService } from '../service/state';
import { LocalStateService } from '../service/state/LocalStateService';
import { TemplateService } from '../service/template';
import { ChainTemplateService } from '../service/template/ChainTemplateService';
import { Singleton } from '../util/container';
import { Counter } from '../util/counter';
import { LocalCounter } from '../util/counter/LocalCounter';

export class LocalModule extends Module {
  protected counter: Singleton<Counter>;
  protected locale: Singleton<LocaleService>;
  protected random: Singleton<RandomGenerator>;
  protected script: Singleton<ScriptService>;
  protected state: Singleton<StateService>;
  protected template: Singleton<TemplateService>;

  constructor() {
    super();

    this.counter = new Singleton(() => mustExist(this.container).create(LocalCounter));
    this.locale = new Singleton(() => mustExist(this.container).create(NextLocaleService));
    this.random = new Singleton(() => mustExist(this.container).create(SeedRandomGenerator));
    this.script = new Singleton(() => mustExist(this.container).create(LocalScriptService));
    this.state = new Singleton(() => mustExist(this.container).create(LocalStateService));
    this.template = new Singleton(() => mustExist(this.container).create(ChainTemplateService));
  }

  public async configure(options: ModuleOptions): Promise<void> {
    await super.configure(options);

    this.bind(INJECT_PARSER).toConstructor(YamlParser);
  }

  /**
   * Singleton counter/ID generator.
   */
  @Provides(INJECT_COUNTER)
  protected async getCounter(): Promise<Counter> {
    return this.counter.get();
  }

  @Provides(INJECT_LOCALE)
  protected async getLocale(): Promise<LocaleService> {
    return this.locale.get();
  }

  /**
   * Root logger, call `.child()` to specialize.
   */
  @Provides(INJECT_LOGGER)
  protected async getLogger(): Promise<Logger> {
    return mustExist(this.logger);
  }

  /**
   * Singleton random number generator.
   */
  @Provides(INJECT_RANDOM)
  protected async getRandom(): Promise<RandomGenerator> {
    return this.random.get();
  }

  /**
   * Singleton script Service.
   */
  @Provides(INJECT_SCRIPT)
  protected async getScript(): Promise<ScriptService> {
    return this.script.get();
  }

  /**
   * Singleton state Service.
   */
  @Provides(INJECT_STATE)
  protected async getState(): Promise<StateService> {
    return this.state.get();
  }

  /**
   * Singleton template library.
   */
  @Provides(INJECT_TEMPLATE)
  protected async getTemplate(): Promise<TemplateService> {
    return this.template.get();
  }
}
