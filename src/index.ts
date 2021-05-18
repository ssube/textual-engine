import { isNil } from '@apextoaster/js-utils';
import { BaseOptions, Container } from 'noicejs';
import { argv } from 'process';

import { BunyanLogger } from './logger/BunyanLogger';
import { INJECT_LOADER, INJECT_PARSER, INJECT_RENDER, INJECT_STATE } from './module';
import { InputModule } from './module/InputModule';
import { LocalModule } from './module/LocalModule';
import { Loader } from './service/loader';
import { Parser } from './service/parser';
import { Render } from './service/render';
import { StateService } from './service/state';
import { asyncTrack } from './util/async';
import { loadConfig } from './util/config';
import { PORTAL_DEPTH } from './util/constants';

export async function main(args: Array<string>): Promise<number> {
  // set up async tracking
  const { asyncHook, asyncOps } = asyncTrack();
  asyncHook.enable();

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

  // send logs to screen

  // resource loading services
  const loader = await container.create<Loader, BaseOptions>(INJECT_LOADER);
  const parser = await container.create<Parser, BaseOptions>(INJECT_PARSER);

  // load data files
  const dataStr = await loader.loadStr(dataPath);
  const data = parser.load(dataStr);

  // find world template
  const world = data.worlds.find((it) => it.meta.id === worldName);
  if (isNil(world)) {
    logger.error('invalid world');
    return 1;
  }

  // create state from world
  const stateCtrl = await container.create<StateService, BaseOptions>(INJECT_STATE);
  await stateCtrl.from(world, {
    depth: PORTAL_DEPTH,
    seed,
  });

  // start renderer
  const render = await container.create<Render, BaseOptions>(INJECT_RENDER);
  await render.start();
  await render.loop('start > ');
  await render.stop();

  // asyncDebug(asyncOps);

  return 0;
}

main(argv).then((exitCode: number) => {
  console.log('main exited %s', exitCode);
  process.exitCode = exitCode;
}).catch((err) => {
  console.error('error in main', err);
  process.exitCode = 1;
});
