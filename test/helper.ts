import { ConsoleLogger, Container, Logger, LogLevel, Module, NullLogger } from 'noicejs';
import { createStubInstance, stub } from 'sinon';

import { LocalScriptService, MathRandomService, StateEntityTransfer } from '../src/lib';
import { ConfigFile } from '../src/model/file/Config';
import { INJECT_CONFIG, INJECT_LOGGER } from '../src/module';
import { ScriptContext, StateHelper } from '../src/service/script';
import { makeTestRoom } from './entity';

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
      bundles: {},
      current: 'en',
      words: {
        articles: [],
        prepositions: [],
        verbs: [],
      },
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
    find: stub(),
    move: stub(),
    quit: stub(),
    show: stub(),
    update: stub(),
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
    data: new Map(),
    logger: getTestLogger(),
    random: createStubInstance(MathRandomService),
    script: createStubInstance(LocalScriptService),
    source: {
      room: makeTestRoom('', '', ''),
    },
    state: getStubHelper(),
    transfer: createTestTransfer(),
    ...parts,
  };
}
