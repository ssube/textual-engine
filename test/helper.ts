import { Container, LogLevel, Module, NullLogger } from 'noicejs';
import { stub } from 'sinon';

import { ConfigFile } from '../src/model/file/Config';
import { INJECT_CONFIG, INJECT_LOGGER } from '../src/module';
import { FocusEvents } from '../src/util/state/FocusResolver';

export function getTestLogger() {
  // TODO: return console/bunyan logger if TEST_LOGGER=that
  return NullLogger.global;
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
    },
    services: {
      actors: [],
      loaders: [],
      renders: [],
      states: [],
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

export function getStubEvents(): FocusEvents {
  return {
    onActor: stub(),
    onQuit: stub(),
    onRoom: stub(),
    onShow: stub(),
  };
}
