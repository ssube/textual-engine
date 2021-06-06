import { InvalidArgumentError, isNil } from '@apextoaster/js-utils';
import { BaseOptions, Container, Module } from 'noicejs';

import { BunyanLogger } from './logger/BunyanLogger';
import { INJECT_EVENT, INJECT_LOCALE } from './module';
import { BrowserModule } from './module/BrowserModule';
import { CoreModule } from './module/CoreModule';
import { NodeModule } from './module/NodeModule';
import { EventBus } from './service/event';
import { LocaleService } from './service/locale';
import { onceEvent } from './util/async/event';
import { parseArgs } from './util/config/args';
import { loadConfig } from './util/config/file';
import {
  EVENT_ACTOR_OUTPUT,
  EVENT_LOADER_READ,
  EVENT_LOADER_WORLD,
  EVENT_LOCALE_BUNDLE,
  EVENT_RENDER_OUTPUT,
  EVENT_STATE_STEP,
} from './util/constants';
import { ServiceManager } from './util/service/ServiceManager';

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
  const logger = BunyanLogger.create(config.logger);

  // print banner
  logger.info({
    arg,
  }, 'textual adventure');

  // create DI modules
  const modules = arg.module.map((it) => {
    const ctor = LOADED_MODULES.get(it);
    if (isNil(ctor)) {
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

  // emit input args
  for (const input of arg.input) {
    // await output before next command
    const pending = onceEvent(events, EVENT_ACTOR_OUTPUT);
    events.emit(EVENT_RENDER_OUTPUT, {
      line: input,
    });
    await pending;
  }

  // trigger the first render
  events.emit(EVENT_STATE_STEP, {
    step: {
      time: 0,
      turn: 0,
    },
  });

  // wait for something to quit
  await onceEvent(events, 'quit');
  await services.stop();

  // TODO: clean up within services
  await locale.stop();

  // eventDebug(events);
  // events.removeAllListeners();
  // asyncDebug(asyncOps);

  return 0;
}
