import { InvalidArgumentError, isNone } from '@apextoaster/js-utils';
import { BaseOptions, Container, Module } from 'noicejs';

import { BunyanLogger } from './logger/BunyanLogger.js';
import { BrowserModule } from './module/BrowserModule.js';
import { CoreModule } from './module/CoreModule.js';
import { INJECT_EVENT, INJECT_LOCALE } from './module/index.js';
import { NodeModule } from './module/NodeModule.js';
import { EventBus } from './service/event/index.js';
import { LocaleService } from './service/locale/index.js';
import { onceEvent } from './util/async/event.js';
import { parseArgs } from './util/config/args.js';
import { loadConfig } from './util/config/file.js';
import {
  EVENT_ACTOR_OUTPUT,
  EVENT_COMMON_QUIT,
  EVENT_LOADER_READ,
  EVENT_LOADER_WORLD,
  EVENT_LOCALE_BUNDLE,
  EVENT_RENDER_INPUT,
} from './util/constants.js';
import { ServiceManager } from './util/service/ServiceManager.js';

// collect modules
export const LOADED_MODULES = new Map<string, new () => Module>([
  ['browser', BrowserModule],
  ['core', CoreModule],
  ['node', NodeModule],
]) as ReadonlyMap<string, new () => Module>;

export async function main(args: Array<string>): Promise<number> {
  // parse args
  const arg = parseArgs(args);

  // load config and create logger
  const config = await loadConfig(arg.config);
  const logger = BunyanLogger.create({
    ...config.logger,
    kind: 'main',
  });

  // print banner
  logger.info({
    arg,
  }, 'textual adventure');

  // create DI modules
  const modules = arg.module.map((it) => {
    const ctor = LOADED_MODULES.get(it);
    if (isNone(ctor)) {
      throw new InvalidArgumentError('module not found');
    }
    const module = new ctor();
    if (it === 'core') {
      (module as CoreModule).setConfig(config);
    }
    return module;
  });

  // configure DI container
  const container = Container.from(...modules);
  await container.configure({
    logger,
  });

  const locale = await container.create<LocaleService, BaseOptions>(INJECT_LOCALE);
  await locale.start();

  // start svc mgr
  const services = await container.create(ServiceManager);
  services.add('locale', locale);

  await services.create(config.services);

  // load common locale
  const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
  events.emit(EVENT_LOCALE_BUNDLE, {
    name: 'common',
    bundle: config.locale,
  });

  // emit data paths
  logger.info({
    paths: arg.data,
  }, 'loading worlds from data files');

  for (const path of arg.data) {
    const pending = onceEvent(events, EVENT_LOADER_WORLD);
    events.emit(EVENT_LOADER_READ, {
      path,
    });
    await pending;
  }

  const quit = onceEvent(events, EVENT_COMMON_QUIT);

  // emit input args
  for (const input of arg.input) {
    // await output before next command
    const pending = onceEvent(events, EVENT_ACTOR_OUTPUT);
    events.emit(EVENT_RENDER_INPUT, {
      line: input,
    });

    // handle very early quit events from state
    await Promise.race([pending, quit]);
  }

  // wait for render to quit (because actor quit, because state quit)
  await quit;
  await services.stop();

  // eventDebug(events);
  // events.removeAllListeners();
  // asyncDebug(asyncOps);

  return 0;
}
