import { Container, LogLevel, Module, NullLogger } from 'noicejs';

import { ConfigFile } from '../src/model/file/Config';
import { INJECT_CONFIG, INJECT_LOGGER } from '../src/module';

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
