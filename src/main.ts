import { InvalidArgumentError, isNil } from '@apextoaster/js-utils';
import { BaseOptions, Container, Module } from 'noicejs';

import { BunyanLogger } from './logger/BunyanLogger';
import { ActorType } from './model/entity/Actor';
import { INJECT_ACTOR, INJECT_EVENT, INJECT_LOCALE } from './module';
import { ActorLocator, ActorModule } from './module/ActorModule';
import { BrowserModule } from './module/BrowserModule';
import { CoreModule } from './module/CoreModule';
import { NodeModule } from './module/NodeModule';
import { EventBus } from './service/event';
import { LocaleService } from './service/locale';
import { asyncTrack } from './util/async/debug';
import { onceEvent } from './util/async/event';
import { parseArgs } from './util/config/args';
import { loadConfig } from './util/config/file';
import { EVENT_ACTOR_OUTPUT, EVENT_LOADER_READ, EVENT_LOCALE_BUNDLE, EVENT_RENDER_OUTPUT } from './util/constants';
import { ServiceManager } from './util/service/ServiceManager';

const DI_MODULES = new Map<string, new () => Module>([
  ['browser', BrowserModule],
  ['input', ActorModule],
  ['local', CoreModule],
  ['node', NodeModule],
]);

export async function main(args: Array<string>): Promise<number> {
  const { asyncHook, asyncOps } = asyncTrack();
  asyncHook.enable();

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
  const coreModule = new CoreModule();
  coreModule.setConfig(config);

  const modules = arg.module.map((it) => {
    const ctor = DI_MODULES.get(it);
    if (isNil(ctor)) {
      throw new InvalidArgumentError('module not found');
    }
    return new ctor();
  });

  // configure DI container
  const container = Container.from(coreModule, ...modules);
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

  // start player actor
  // TODO: this does not belong here
  const locator = await container.create<ActorLocator, BaseOptions>(INJECT_ACTOR);
  const actor = await locator.get({
    id: '', // does not matter, very smelly
    type: ActorType.PLAYER,
  });
  await actor.start();

  // emit data paths
  logger.info({
    paths: arg.data,
  }, 'loading worlds from data files');

  for (const path of arg.data) {
    events.emit(EVENT_LOADER_READ, {
      path,
    });
  }

  // emit input args
  for (const input of arg.input) {
    events.emit(EVENT_RENDER_OUTPUT, {
      lines: [
        input,
      ],
    });

    // await output before next command
    await onceEvent(events, EVENT_ACTOR_OUTPUT);
  }

  // wait for something to quit
  await onceEvent(events, 'quit');

  await services.stop();
  await actor.stop();

  // asyncDebug(asyncOps);
  // eventDebug(events);

  // TODO: clean up within each service
  events.removeAllListeners();

  return 0;
}
