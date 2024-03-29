import { ConsoleLogger, Container, Logger, LogLevel, Module, NullLogger } from 'noicejs';
import sinon from 'sinon';

import { ConfigFile } from '../src/model/file/Config.js';
import { INJECT_CONFIG, INJECT_LOGGER } from '../src/module/index.js';
import { MathRandomService } from '../src/service/random/MathRandom.js';
import { CommandHelper, ScriptContext, StateHelper } from '../src/service/script/index.js';
import { LocalScriptService } from '../src/service/script/LocalScript.js';
import { zeroStep } from '../src/util/entity/index.js';
import { StateEntityTransfer } from '../src/util/entity/EntityTransfer.js';
import { makeTestRoom } from './entity.js';

export { SinonStub } from 'sinon';

// eslint-disable-next-line @typescript-eslint/unbound-method
export const { createStubInstance, stub, spy, match, useFakeTimers } = sinon;

export function getTestLogger(): Logger {
  if (process.env.DEBUG === 'TRUE') {
    return ConsoleLogger.global;
  } else {
    return NullLogger.global;
  }
}

export function getTestConfig(): ConfigFile {
  return {
    logger: {
      level: LogLevel.DEBUG,
      name: 'test',
      streams: [],
    },
    locale: {
      languages: {},
      current: 'en',
    },
    services: {
      actors: [],
      loaders: [],
      renders: [],
      states: [],
      tokenizers: [],
    },
  };
}

export async function getTestContainer(...modules: Array<Module>): Promise<Container> {
  const config = getTestConfig();
  const logger = getTestLogger();

  modules[0].bind(INJECT_CONFIG).toInstance(config);
  modules[0].bind(INJECT_LOGGER).toInstance(logger);

  const container = Container.from(...modules);
  await container.configure({
    logger,
  });

  return container;
}

export function getStubHelper(): StateHelper {
  return {
    create: stub(),
    enter: stub(),
    find: stub().resolves([]),
    move: stub(),
    quit: stub(),
    show: stub(),
    update: async (entity, changes) => {
      Object.assign(entity, changes);
    },
  };
}

export function createStubBehavior(): CommandHelper {
  return {
    depth: stub(),
    output: stub(),
    queue: stub(),
    ready: stub(),
  };
}

export function createTestTransfer(): StateEntityTransfer {
  return {
    moveActor: stub(),
    moveItem: stub(),
  } as any;
}

export function createTestContext(parts: Partial<ScriptContext> = {}): ScriptContext {
  return {
    behavior: createStubBehavior(),
    data: new Map(),
    logger: getTestLogger(),
    random: createStubInstance(MathRandomService),
    script: createStubInstance(LocalScriptService),
    source: {
      room: makeTestRoom('', '', ''),
    },
    state: getStubHelper(),
    step: zeroStep(),
    ...parts,
  };
}
