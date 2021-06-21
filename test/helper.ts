import { defer, doesExist } from '@apextoaster/js-utils';
import { BaseOptions, ConsoleLogger, Container, Logger, LogLevel, Module, NullLogger } from 'noicejs';
import { stub } from 'sinon';
import { LocaleService } from '../src/lib';

import { ConfigFile } from '../src/model/file/Config';
import { INJECT_CONFIG, INJECT_LOCALE, INJECT_LOGGER } from '../src/module';
import { StateHelper } from '../src/service/script';

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
      verbs: [],
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
    enter: stub(),
    find: stub(),
    move: stub(),
    quit: stub(),
    show: stub(),
  };
}
