import { isNil, mustExist } from '@apextoaster/js-utils';
import { Logger, Module, ModuleOptions, Provides } from 'noicejs';

import {
  INJECT_COUNTER,
  INJECT_INPUT_MAPPER,
  INJECT_INPUT_PLAYER,
  INJECT_LOADER,
  INJECT_LOGGER,
  INJECT_PARSER,
  INJECT_RANDOM,
  INJECT_RENDER,
  INJECT_SCRIPT,
  INJECT_STATE,
  INJECT_TEMPLATE,
} from '.';
import { Input } from '../service/input';
import { ActorInputMapper, InputTypes } from '../service/input/ActorInputMapper';
import { ClassicInput } from '../service/input/ClassicInput';
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
import { Counter } from '../util/counter';
import { LocalCounter } from '../util/counter/LocalCounter';

export interface LocalModuleOptions {
  inputs: InputTypes;
  seed: string;
}

export class LocalModule extends Module {
  protected options: LocalModuleOptions;

  protected counter?: Counter;
  protected mapper?: ActorInputMapper;
  protected playerInput?: Input;
  protected random?: RandomGenerator;
  protected render?: Render;
  protected script?: ScriptService;
  protected state?: StateService;
  protected template?: TemplateService;

  constructor(options: LocalModuleOptions) {
    super();
    this.options = options;
  }

  public async configure(options: ModuleOptions): Promise<void> {
    await super.configure(options);

    this.bind(INJECT_LOADER).toConstructor(FileLoader);
    this.bind(INJECT_PARSER).toConstructor(YamlParser);
  }

  @Provides(INJECT_RENDER)
  protected async getRender(): Promise<Render> {
    if (isNil(this.render)) {
      this.render = await mustExist(this.container).create(InkRender);
      // this.render = await mustExist(this.container).create(LineRender);
    }

    return this.render;
  }

  /**
   * Singleton template library.
   */
  @Provides(INJECT_TEMPLATE)
  protected async getTemplate(): Promise<TemplateService> {
    if (isNil(this.template)) {
      this.template = await mustExist(this.container).create(ChainTemplateService);
    }

    return this.template;
  }

  /**
   * Singleton counter/ID generator.
   */
  @Provides(INJECT_COUNTER)
  protected async getCounter(): Promise<Counter> {
    if (isNil(this.counter)) {
      this.counter = await mustExist(this.container).create(LocalCounter);
    }

    return this.counter;
  }

  /**
   * Actor type input mapper.
   *
   * This construct should not exist.
   */
  @Provides(INJECT_INPUT_MAPPER)
  protected async getMapper(): Promise<ActorInputMapper> {
    if (isNil(this.mapper)) {
      this.mapper = await mustExist(this.container).create(ActorInputMapper, {
        inputs: this.options.inputs,
      });
    }

    return this.mapper;
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
    if (isNil(this.random)) {
      this.random = await mustExist(this.container).create(SeedRandomGenerator);
      this.random.reseed(this.options.seed);
    }

    return this.random;
  }

  /**
   * Singleton script Service.
   */
  @Provides(INJECT_SCRIPT)
  protected async getScript(): Promise<ScriptService> {
    if (isNil(this.script)) {
      this.script = await mustExist(this.container).create(LocalScriptService);
    }

    return this.script;
  }

  /**
   * Singleton state Service.
   */
  @Provides(INJECT_STATE)
  protected async getState(): Promise<StateService> {
    if (isNil(this.state)) {
      this.state = await mustExist(this.container).create(LocalStateService);
    }

    return this.state;
  }

  /**
   * Singleton player input.
   */
  @Provides(INJECT_INPUT_PLAYER)
  protected async getPlayerInput(): Promise<Input> {
    if (isNil(this.playerInput)) {
      this.playerInput = await mustExist(this.container).create(ClassicInput);
    }

    return this.playerInput;
  }
}
