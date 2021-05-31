import { mustExist } from '@apextoaster/js-utils';
import { Logger, Module, ModuleOptions, Provides } from 'noicejs';

import {
  INJECT_CONFIG,
  INJECT_COUNTER,
  INJECT_EVENT,
  INJECT_LOCALE,
  INJECT_LOGGER,
  INJECT_PARSER,
  INJECT_RANDOM,
  INJECT_SCRIPT,
  INJECT_TEMPLATE,
  INJECT_TOKENIZER,
} from '.';
import { ConfigFile } from '../model/file/Config';
import { BehaviorActorService } from '../service/actor/BehaviorActor';
import { PlayerActorService } from '../service/actor/PlayerActor';
import { Counter } from '../service/counter';
import { LocalCounter } from '../service/counter/LocalCounter';
import { EventBus } from '../service/event';
import { NodeEventBus } from '../service/event/NodeEventBus';
import { LocaleService } from '../service/locale';
import { NextLocaleService } from '../service/locale/NextLocale';
import { YamlParser } from '../service/parser/YamlParser';
import { RandomGenerator } from '../service/random';
import { AleaRandomGenerator } from '../service/random/AleaRandom';
import { ScriptService } from '../service/script';
import { LocalScriptService } from '../service/script/LocalScript';
import { LocalStateService } from '../service/state/TurnState';
import { TemplateService } from '../service/template';
import { ChainTemplateService } from '../service/template/ChainTemplateService';
import { WordTokenizer } from '../service/tokenizer/WordTokenizer';
import { Singleton } from '../util/container';

export class CoreModule extends Module {
  protected counter: Singleton<Counter>;
  protected event: Singleton<EventBus>;
  protected locale: Singleton<LocaleService>;
  protected random: Singleton<RandomGenerator>;
  protected script: Singleton<ScriptService>;
  protected template: Singleton<TemplateService>;

  constructor() {
    super();

    this.counter = new Singleton(() => mustExist(this.container).create(LocalCounter));
    this.event = new Singleton(() => mustExist(this.container).create(NodeEventBus));
    this.locale = new Singleton(() => mustExist(this.container).create(NextLocaleService));
    this.random = new Singleton(() => mustExist(this.container).create(AleaRandomGenerator));
    this.script = new Singleton(() => mustExist(this.container).create(LocalScriptService));
    this.template = new Singleton(() => mustExist(this.container).create(ChainTemplateService));
  }

  public async configure(options: ModuleOptions): Promise<void> {
    await super.configure(options);

    this.bind(INJECT_EVENT).toFactory(() => this.event.get());
    this.bind(INJECT_PARSER).toConstructor(YamlParser); // TODO: singleton
    this.bind(INJECT_TOKENIZER).toConstructor(WordTokenizer); // TODO: singleton

    this.bind('core-behavior-actor').toConstructor(BehaviorActorService);
    this.bind('core-player-actor').toConstructor(PlayerActorService);

    this.bind('core-local-state').toConstructor(LocalStateService);
  }

  public setConfig(config: ConfigFile): void {
    this.bind(INJECT_CONFIG).toInstance(config);
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
   * Singleton template library.
   */
  @Provides(INJECT_TEMPLATE)
  protected async getTemplate(): Promise<TemplateService> {
    return this.template.get();
  }
}
