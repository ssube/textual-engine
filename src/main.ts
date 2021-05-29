import { InvalidArgumentError, isNil } from '@apextoaster/js-utils';
import { BaseOptions, Container, Module } from 'noicejs';

import { BunyanLogger } from './logger/BunyanLogger';
import { ActorType } from './model/entity/Actor';
import { INJECT_ACTOR, INJECT_CONFIG, INJECT_EVENT, INJECT_LOADER, INJECT_LOCALE, INJECT_PARSER, INJECT_RENDER, INJECT_STATE } from './module';
import { ActorLocator, ActorModule } from './module/ActorModule';
import { BrowserModule } from './module/BrowserModule';
import { LocalModule } from './module/LocalModule';
import { NodeModule } from './module/NodeModule';
import { EventBus } from './service/event';
import { LoaderService } from './service/loader';
import { LocaleService } from './service/locale';
import { Parser } from './service/parser';
import { RenderService } from './service/render';
import { StateService } from './service/state';
import { parseArgs } from './util/args';
import { loadConfig } from './util/config/file';

const DI_MODULES = new Map<string, new () => Module>([
  ['browser', BrowserModule],
  ['input', ActorModule],
  ['local', LocalModule],
  ['node', NodeModule],
]);

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
    const ctor = DI_MODULES.get(it);
    if (isNil(ctor)) {
      throw new InvalidArgumentError('module not found');
    }
    return new ctor();
  });

  // TODO: bind to base module, once such a thing exists
  modules[0].bind(INJECT_CONFIG).toInstance(config);

  // configure DI container
  const container = Container.from(...modules);
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
    events.emit('loader-path', {
      path,
    });
  }

  await state.stop();
  await render.stop();
  await loader.stop();

  return 0;
}
