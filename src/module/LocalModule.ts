import { mustExist } from '@apextoaster/js-utils';
import { Logger, Module, ModuleOptions, Provides } from 'noicejs';

import {
  INJECT_COUNTER,
  INJECT_LOADER,
  INJECT_LOGGER,
  INJECT_PARSER,
  INJECT_RANDOM,
  INJECT_RENDER,
  INJECT_SCRIPT,
  INJECT_STATE,
  INJECT_TEMPLATE,
} from '.';
import { FileLoader } from '../service/loader/FileLoader';
import { YamlParser } from '../service/parser/YamlParser';
import { RandomGenerator } from '../service/random';
import { SeedRandomGenerator } from '../service/random/SeedRandom';
import { Render } from '../service/render';
import { InkRender } from '../service/render/InkRender';
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
  protected random: Singleton<RandomGenerator>;
  protected render: Singleton<Render>;
  protected script: Singleton<ScriptService>;
  protected state: Singleton<StateService>;
  protected template: Singleton<TemplateService>;

  constructor() {
    super();

    this.counter = new Singleton();
    this.random = new Singleton();
    this.render = new Singleton();
    this.script = new Singleton();
    this.state = new Singleton();
    this.template = new Singleton();
  }

  public async configure(options: ModuleOptions): Promise<void> {
    await super.configure(options);

    this.bind(INJECT_LOADER).toConstructor(FileLoader);
    this.bind(INJECT_PARSER).toConstructor(YamlParser);
  }

  @Provides(INJECT_RENDER)
  protected async getRender(): Promise<Render> {
    // this.render = await mustExist(this.container).create(LineRender);
    return this.render.get(() => mustExist(this.container).create(InkRender));
  }

  /**
   * Singleton template library.
   */
  @Provides(INJECT_TEMPLATE)
  protected async getTemplate(): Promise<TemplateService> {
    return this.template.get(() => mustExist(this.container).create(ChainTemplateService));
  }

  /**
   * Singleton counter/ID generator.
   */
  @Provides(INJECT_COUNTER)
  protected async getCounter(): Promise<Counter> {
    return this.counter.get(() => mustExist(this.container).create(LocalCounter));
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
    return this.random.get(() => mustExist(this.container).create(SeedRandomGenerator));
  }

  /**
   * Singleton script Service.
   */
  @Provides(INJECT_SCRIPT)
  protected async getScript(): Promise<ScriptService> {
    return this.script.get(() => mustExist(this.container).create(LocalScriptService));
  }

  /**
   * Singleton state Service.
   */
  @Provides(INJECT_STATE)
  protected async getState(): Promise<StateService> {
    return this.state.get(() => mustExist(this.container).create(LocalStateService));
  }
}
