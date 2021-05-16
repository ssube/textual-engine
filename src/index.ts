import { isNil } from '@apextoaster/js-utils';
import * as Logger from 'bunyan';
import { BaseOptions, Container, LogLevel } from 'noicejs';
import { argv } from 'process';

import { BunyanLogger } from './logger/BunyanLogger';
import { ActorType } from './model/entity/Actor';
import { INJECT_INPUT_PLAYER, INJECT_LOADER, INJECT_PARSER, INJECT_RENDER, INJECT_STATE } from './module';
import { LocalModule } from './module/LocalModule';
import { BehaviorInput } from './service/input/BehaviorInput';
import { Loader } from './service/loader';
import { Parser } from './service/parser';
import { Render } from './service/render';
import { StateController } from './service/state';
import { asyncTrack } from './util/async';
import { loadConfig } from './util/config';
import { PORTAL_DEPTH } from './util/constants';
import { RenderStream } from './util/logger/RenderStream';

export async function main(args: Array<string>): Promise<number> {
  // set up async tracking
  const { asyncHook, asyncOps } = asyncTrack();
  asyncHook.enable();

  // "parse" args
  const [_node, _script, configPath, dataPath, worldName, seed] = args;

  // load config and create logger
  const config = await loadConfig(configPath)
  const logger = BunyanLogger.create(config.logger);

  // print banner
  logger.info({
    args,
  }, 'textual adventure');

  // create DI module
  const module = new LocalModule({
    inputs: {
      [ActorType.DEFAULT]: BehaviorInput,
      [ActorType.PLAYER]: INJECT_INPUT_PLAYER,
      [ActorType.REMOTE]: BehaviorInput,
    },
    seed,
  });

  // configure DI container
  const container = Container.from(module);
  await container.configure({
    logger,
  });

  // send logs to screen
  const render = await container.create<Render, BaseOptions>(INJECT_RENDER);
  const stream = new RenderStream(render);
  (logger as Logger).addStream({
    level: LogLevel.INFO,
    type: 'raw',
    stream,
  });

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
  const stateCtrl = await container.create<StateController, BaseOptions>(INJECT_STATE);
  await stateCtrl.from(world, {
    rooms: PORTAL_DEPTH,
    seed,
  });

  // step state stuff
  await render.start();
  await render.loop(`turn 0 > `);
  await render.stop();

  // save state game
  const saveState = await stateCtrl.save();
  const saveStr = parser.save({
    states: [saveState],
    worlds: [],
  });

  logger.info({
    state: saveStr,
  }, 'saved world state');

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
