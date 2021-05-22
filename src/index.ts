import { isNil } from '@apextoaster/js-utils';
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
import { loadConfig } from './util/config';
import { PORTAL_DEPTH } from './util/constants';

export async function main(args: Array<string>): Promise<number> {
  // "parse" args
  const [_node, _script, configPath, dataPath, worldName, seed] = args;

  // load config and create logger
  const config = await loadConfig(configPath);
  const logger = BunyanLogger.create(config.logger);

  // print banner
  logger.info({
    args,
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
  const loader = await container.create<Loader, BaseOptions>(INJECT_LOADER);
  const parser = await container.create<Parser, BaseOptions>(INJECT_PARSER);

  const dataStr = await loader.loadStr(dataPath);
  const data = parser.load(dataStr);

  // find world template
  const world = data.worlds.find((it) => it.meta.id === worldName);
  if (isNil(world)) {
    logger.error('invalid world');
    return 1;
  }

  // create state from world
  const state = await container.create<StateService, BaseOptions>(INJECT_STATE);
  await state.from(world, {
    depth: PORTAL_DEPTH,
    seed,
  });

  // start renderer
  const render = await container.create<RenderService, BaseOptions>(INJECT_RENDER);
  await render.start();
  await state.loop();
  await render.stop();

  return 0;
}

main(argv).then((exitCode: number) => {
  console.log('main exited %s', exitCode);
  process.exitCode = exitCode;
}).catch((err) => {
  console.error('error in main', err);
  process.exitCode = 1;
});
