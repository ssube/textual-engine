import { isNil, mustExist } from '@apextoaster/js-utils';
import { Logger, LogLevel, Module, ModuleOptions, Provides } from 'noicejs';

import { INJECT_COUNTER, INJECT_INPUT_MAPPER, INJECT_LOGGER, INJECT_RANDOM, INJECT_SCRIPT } from '.';
import { BunyanLogger } from '../logger/BunyanLogger';
import { ActorInputMapper, InputTypes } from '../service/input/ActorInputMapper';
import { RandomGenerator } from '../service/random';
import { SeedRandomGenerator } from '../service/random/SeedRandom';
import { ScriptController } from '../service/script';
import { LocalScriptController } from '../service/script/LocalScriptController';
import { Counter } from '../util/counter';
import { LocalCounter } from '../util/counter/LocalCounter';

export interface LocalModuleOptions {
  inputs: InputTypes;
  logger: {
    level: LogLevel;
    name: string;
  };
}

export class LocalModule extends Module {
  protected options: LocalModuleOptions;

  protected counter?: Counter;
  protected mapper?: ActorInputMapper;
  protected random?: RandomGenerator;
  protected script?: ScriptController;

  constructor(options: LocalModuleOptions) {
    super();
    this.options = options;
  }

  async configure(options: ModuleOptions) {
    await super.configure(options);
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
    if (isNil(this.logger)) {
      this.logger = BunyanLogger.create(this.options.logger);
    }

    return this.logger;
  }

  @Provides(INJECT_RANDOM)
  protected async getRandom() {
    if (isNil(this.random)) {
      this.random = await mustExist(this.container).create(SeedRandomGenerator);
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
}
