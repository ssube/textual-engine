import { isNil, mustExist } from '@apextoaster/js-utils';
import { Module, ModuleOptions, Provides } from 'noicejs';

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
  INJECT_TEMPLATE,
} from '.';
import { Input } from '../service/input';
import { ActorInputMapper, InputTypes } from '../service/input/ActorInputMapper';
import { ClassicInput } from '../service/input/ClassicInput';
import { FileLoader } from '../service/loader/FileLoader';
import { YamlParser } from '../service/parser/YamlParser';
import { RandomGenerator } from '../service/random';
import { SeedRandomGenerator } from '../service/random/SeedRandom';
import { InkRender } from '../service/render/InkRender';
import { ScriptController } from '../service/script';
import { LocalScriptController } from '../service/script/LocalScriptController';
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
  protected script?: ScriptController;

  constructor(options: LocalModuleOptions) {
    super();
    this.options = options;
  }

  async configure(options: ModuleOptions) {
    await super.configure(options);

    this.bind(INJECT_LOADER).toConstructor(FileLoader);
    this.bind(INJECT_PARSER).toConstructor(YamlParser);
    // this.bind(INJECT_RENDER).toConstructor(LineRender);
    this.bind(INJECT_RENDER).toConstructor(InkRender);
    this.bind(INJECT_TEMPLATE).toConstructor(PipeTemplate);
  }

  @Provides(INJECT_COUNTER)
  protected async getCounter() {
    if (isNil(this.counter)) {
      this.counter = await mustExist(this.container).create(LocalCounter);
    }

    return this.counter;
  }

  @Provides(INJECT_INPUT_MAPPER)
  protected async getMapper() {
    if (isNil(this.mapper)) {
      this.mapper = await mustExist(this.container).create(ActorInputMapper, {
        inputs: this.options.inputs,
      });
    }

    return this.mapper;
  }

  @Provides(INJECT_LOGGER)
  protected getLogger() {
    return mustExist(this.logger);
  }

  @Provides(INJECT_RANDOM)
  protected async getRandom() {
    if (isNil(this.random)) {
      this.random = await mustExist(this.container).create(SeedRandomGenerator);
      this.random.reseed(this.options.seed);
    }

    return this.random;
  }

  @Provides(INJECT_SCRIPT)
  protected async getScript() {
    if (isNil(this.script)) {
      this.script = await mustExist(this.container).create(LocalScriptController);
    }

    return this.script;
  }

  @Provides(INJECT_INPUT_PLAYER)
  protected async getPlayerInput() {
    if (isNil(this.playerInput)) {
      this.playerInput = await mustExist(this.container).create(ClassicInput);
    }

    return this.playerInput;
  }
}
