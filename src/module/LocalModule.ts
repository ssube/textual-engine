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
import { LineRender } from '../service/render/LineRender';
import { ScriptController } from '../service/script';
import { LocalScriptController } from '../service/script/LocalScriptController';
import { StateController } from '../service/state';
import { LocalStateController } from '../service/state/LocalStateController';
import { TemplateService } from '../service/template';
import { PipeTemplate } from '../service/template/PipeTemplate';
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
  protected script?: ScriptController;
  protected state?: StateController;
  protected template?: TemplateService;

  constructor(options: LocalModuleOptions) {
    super();
    this.options = options;
  }

  async configure(options: ModuleOptions) {
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
      this.template = await mustExist(this.container).create(PipeTemplate);
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
   * Singleton script controller.
   */
  @Provides(INJECT_SCRIPT)
  protected async getScript(): Promise<ScriptController> {
    if (isNil(this.script)) {
      this.script = await mustExist(this.container).create(LocalScriptController);
    }

    return this.script;
  }

  /**
   * Singleton state controller.
   */
  @Provides(INJECT_STATE)
  protected async getState(): Promise<StateController> {
    if (isNil(this.state)) {
      this.state = await mustExist(this.container).create(LocalStateController);
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
