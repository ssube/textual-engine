import { InvalidArgumentError, isNil } from '@apextoaster/js-utils';
import { BaseOptions, Container, Module } from 'noicejs';

import { BunyanLogger } from './logger/BunyanLogger';
import { INJECT_ACTOR_PLAYER, INJECT_LOADER, INJECT_LOCALE, INJECT_PARSER, INJECT_RENDER, INJECT_STATE } from './module';
import { ActorModule } from './module/ActorModule';
import { BrowserModule } from './module/BrowserModule';
import { LocalModule } from './module/LocalModule';
import { NodeModule } from './module/NodeModule';
import { ActorService } from './service/actor';
import { Loader } from './service/loader';
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

  // configure DI container
  const container = Container.from(...modules);
  await container.configure({
    logger,
  });

  // load config locale
  const locale = await container.create<LocaleService, BaseOptions>(INJECT_LOCALE);
  await locale.start();

  locale.addBundle('common', config.locale);

  const player = await container.create<ActorService, BaseOptions>(INJECT_ACTOR_PLAYER);
  await player.start();

  // load data files
  const loader = await container.create<Loader, BaseOptions>(INJECT_LOADER);
  const parser = await container.create<Parser, BaseOptions>(INJECT_PARSER);

  const worlds = [];
  for (const path of arg.data) {
    const dataStr = await loader.loadStr(path);
    const data = parser.load(dataStr);
    worlds.push(...data.worlds);
  }

  logger.info({
    paths: arg.data,
    worlds: worlds.map((it) => it.meta.id),
  }, 'loaded worlds from data files');

  // find world template
  const world = worlds.find((it) => it.meta.id === arg.world);
  if (isNil(world)) {
    logger.error({ world: arg.world }, 'invalid world name');
    return 1;
  }

  // create state from world
  const state = await container.create<StateService, BaseOptions>(INJECT_STATE);
  await state.create(world, {
    depth: arg.depth,
    seed: arg.seed,
  });

  // start renderer
  const render = await container.create<RenderService, BaseOptions>(INJECT_RENDER);
  await render.start();
  await state.loop();
  await render.stop();

  return 0;
}
