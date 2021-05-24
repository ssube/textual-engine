import { isNil, mustExist } from '@apextoaster/js-utils';
import { BaseOptions, Container } from 'noicejs';
import { argv } from 'process';

import { BunyanLogger } from './logger/BunyanLogger';
import { INJECT_LOADER, INJECT_LOCALE, INJECT_PARSER, INJECT_RENDER, INJECT_STATE } from './module';
import { InputModule } from './module/InputModule';
import { LocalModule } from './module/LocalModule';
import { Loader } from './service/loader';
import { LocaleService } from './service/locale';
import { Parser } from './service/parser';
import { RenderService } from './service/render';
import { StateService } from './service/state';
import { parseArgs } from './util/args';
import { loadConfig } from './util/config/file';
import { PORTAL_DEPTH } from './util/constants';

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
  const modules = [
    new InputModule(),
    new LocalModule(),
  ];

  // configure DI container
  const container = Container.from(...modules);
  await container.configure({
    logger,
  });

  // load config locale
  const locale = await container.create<LocaleService, BaseOptions>(INJECT_LOCALE);
  await locale.start();

  locale.addBundle('common', config.locale);

  // load data files
  const parser = await container.create<Parser, BaseOptions>(INJECT_PARSER);

  const worlds = [];
  for (const path of arg.data) {
    const elem = mustExist(document.getElementById(path));
    const text = mustExist(elem.textContent);
    const data = parser.load(text);
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
  await state.from(world, {
    depth: PORTAL_DEPTH,
    seed: arg.seed,
  });

  // start renderer
  const render = await container.create<RenderService, BaseOptions>(INJECT_RENDER);
  await render.start();
  await state.loop();
  await render.stop();

  return 0;
}

main([
  '--config',
  'data-config',
  '--data',
  'data-world',
  '--seed',
  'test',
  '--world',
  'test',
]).then((exitCode) => {
  console.log('main exited with status', exitCode);
}).catch((err) => {
  console.error('main exited with uncaught error', err);
});
