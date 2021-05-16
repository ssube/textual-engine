import { isNil } from '@apextoaster/js-utils';
import * as Logger from 'bunyan';
import { BaseOptions, Container, LogLevel } from 'noicejs';
import { argv } from 'process';

import { BunyanLogger } from './logger/BunyanLogger';
import { ActorType } from './model/entity/Actor';
import { INJECT_INPUT_PLAYER, INJECT_LOADER, INJECT_PARSER, INJECT_RENDER } from './module';
import { LocalModule } from './module/LocalModule';
import { Input } from './service/input';
import { BehaviorInput } from './service/input/BehaviorInput';
import { Loader } from './service/loader';
import { Parser } from './service/parser';
import { Render } from './service/render';
import { LocalStateController } from './service/state/LocalStateController';
import { asyncTrack } from './util/async';
import { loadConfig } from './util/config';
import { KNOWN_VERBS, PORTAL_DEPTH } from './util/constants';
import { debugState, graphState } from './util/debug';
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

  const input = await container.create<Input, BaseOptions>(INJECT_INPUT_PLAYER);
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
  const stateCtrl = await container.create(LocalStateController);
  const state = await stateCtrl.from(world, {
    rooms: PORTAL_DEPTH,
    seed,
  });

  // step state stuff
  let turnCount = 0;
  let lastNow = Date.now();

  await render.start(`turn ${turnCount} > `);

  // while playing:
  for await (const line of render.stream()) {
    // parse last input
    const [cmd] = await input.parse(line);
    logger.debug({
      cmd,
    }, 'parsed command');

    // handle meta commands
    switch (cmd.verb) {
      case 'debug':
        await debugState(render, state);
        break;
      case 'graph':
        await graphState(loader, render, state, cmd.target);
        break;
      case 'help':
        await render.show(KNOWN_VERBS.join(', '));
        break;
      case 'quit':
        await render.stop();
        break;
      default: {
        // step world
        const now = Date.now();
        await stateCtrl.step(now - lastNow);

        // show any output
        const output = await stateCtrl.getBuffer();
        for (const outputLine of output) {
          await render.show(outputLine);
        }

        // wait for input
        render.prompt(`turn ${++turnCount} > `);
      }
    }
  }

  const saveState = await stateCtrl.save();
  const saveStr = parser.save({
    saves: [{
      state: saveState,
    }],
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
