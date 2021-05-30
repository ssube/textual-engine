import { InvalidArgumentError, isNil } from '@apextoaster/js-utils';
import { BaseOptions, Container, Module } from 'noicejs';

import { BunyanLogger } from './logger/BunyanLogger';
import { ActorType } from './model/entity/Actor';
import { INJECT_ACTOR, INJECT_EVENT, INJECT_LOADER, INJECT_LOCALE, INJECT_RENDER, INJECT_STATE } from './module';
import { ActorLocator, ActorModule } from './module/ActorModule';
import { BrowserModule } from './module/BrowserModule';
import { CoreModule } from './module/CoreModule';
import { NodeModule } from './module/NodeModule';
import { EventBus } from './service/event';
import { LoaderService } from './service/loader';
import { LocaleService } from './service/locale';
import { RenderService } from './service/render';
import { StateService } from './service/state';
import { parseArgs } from './util/args';
import { asyncTrack } from './util/async';
import { loadConfig } from './util/config/file';
import { EVENT_ACTOR_OUTPUT, EVENT_LOADER_PATH, EVENT_RENDER_OUTPUT } from './util/constants';
import { onceEvent } from './util/event';

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

  // load config locale
  const locale = await container.create<LocaleService, BaseOptions>(INJECT_LOCALE);
  await locale.start();

  locale.addBundle('common', config.locale);

  // start player actor
  // TODO: this does not belong here
  const locator = await container.create<ActorLocator, BaseOptions>(INJECT_ACTOR);
  const actor = await locator.get({
    id: '', // does not matter, very smelly
    type: ActorType.PLAYER,
  });
  await actor.start();

  // load data files
  const loader = await container.create<LoaderService, BaseOptions>(INJECT_LOADER);
  await loader.start();

  // start renderer
  const render = await container.create<RenderService, BaseOptions>(INJECT_RENDER);
  await render.start();

  // create state from world
  const state = await container.create<StateService, BaseOptions>(INJECT_STATE);
  await state.start();

  logger.info({
    paths: arg.data,
  }, 'loading worlds from data files');

  const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
  for (const path of arg.data) {
    events.emit(EVENT_LOADER_PATH, {
      path,
    });
  }

  for (const input of arg.input) {
    events.emit(EVENT_RENDER_OUTPUT, {
      lines: [
        input,
      ],
    });

    // await output before next command
    await onceEvent(events, EVENT_ACTOR_OUTPUT);
  }

  await onceEvent(events, 'quit');

  await state.stop();
  await render.stop();
  await loader.stop();
  await actor.stop();
  await locale.stop();

  // asyncDebug(asyncOps);
  // eventDebug(events);

  // TODO: clean up within each service
  events.removeAllListeners();

  return 0;
}
