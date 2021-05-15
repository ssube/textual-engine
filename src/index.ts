import { isNil } from '@apextoaster/js-utils';
import { createHook } from 'async_hooks';
import * as Logger from 'bunyan';
import { promises } from 'fs';
import { BaseOptions, Container, LogLevel } from 'noicejs';
import { argv, exit } from 'process';

import { BunyanLogger } from './logger/BunyanLogger';
import { ActorType } from './model/entity/Actor';
import { INJECT_INPUT_PLAYER } from './module';
import { LocalModule } from './module/LocalModule';
import { Input } from './service/input';
import { BehaviorInput } from './service/input/BehaviorInput';
import { FileLoader } from './service/loader/FileLoader';
import { YamlParser } from './service/parser/YamlParser';
import { LineRender } from './service/render/LineRender';
import { LocalStateController } from './service/state/LocalStateController';
import { PORTAL_DEPTH } from './util/constants';
import { debugState, graphState } from './util/debug';
import { RenderStream } from './util/logger/RenderStream';

export async function main(args: Array<string>) {
  const asyncOps = new Map();
  const asyncHook = createHook({
    init(asyncId, type, triggerAsyncId, resource) {
      asyncOps.set(asyncId, type);
    },
    destroy(asyncId) {
      asyncOps.delete(asyncId);
    },
    promiseResolve(asyncId) {
      asyncOps.delete(asyncId);
    },
  });

  asyncHook.enable();

  function asyncDebug() {
    for (const [key, type] of asyncOps) {
      console.log(`async: ${key} is ${type}`);
    }
  }

  const logger = BunyanLogger.create({
    level: LogLevel.DEBUG,
    name: 'textual-engine',
    stream: process.stderr,
  });

  logger.info({
    args,
  }, 'textual adventure');

  const module = new LocalModule({
    inputs: {
      [ActorType.DEFAULT]: BehaviorInput,
      [ActorType.PLAYER]: INJECT_INPUT_PLAYER,
      [ActorType.REMOTE]: BehaviorInput,
    },
    seed: args[4],
  });

  const container = Container.from(module);
  await container.configure({
    logger,
  });

  // create DI container and services
  const render = await container.create(LineRender);

  // send logs to screen
  const stream = new RenderStream(render);
  (logger as Logger).addStream({
    level: LogLevel.DEBUG,
    type: 'raw',
    stream,
  });

  const input = await container.create<Input, BaseOptions>(INJECT_INPUT_PLAYER);
  const loader = await container.create(FileLoader);
  const parser = await container.create(YamlParser);
  const stateCtrl = await container.create(LocalStateController);

  // load data files
  const dataStr = await loader.loadStr(args[2]);
  const data = parser.load(dataStr);

  // create state from world
  const world = data.worlds.find((it) => it.meta.id === args[3]);
  if (isNil(world)) {
    logger.error('invalid world');
    exit(1);
  }

  const state = await stateCtrl.from(world, {
    rooms: PORTAL_DEPTH,
    seed: args[4],
  });

  let turnCount = 0;
  let lastNow = Date.now();

  // while playing:
  await render.start(`turn ${turnCount} > `);

  for await (const line of render.stream()) {
    // parse last input
    const [cmd] = await input.parse(line);
    logger.debug({
      cmd,
    }, 'parsed command');

    switch (cmd.verb) {
      case 'debug':
        await debugState(render, state);
        break;
      case 'graph':
        await graphState(loader, render, state, cmd.target);
        break;
      case 'help':
        await render.show('help');
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
        render.promptSync(`turn ${++turnCount} > `);
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

  // asyncDebug();
}

main(argv).then(() => {
  console.log('done');
}).catch((err) => {
  console.error('error in main', err);
});
