import { isNil } from '@apextoaster/js-utils';
import { promises } from 'fs';
import { LogLevel } from 'noicejs';
import { argv, exit } from 'process';

import { BunyanLogger } from './logger/BunyanLogger';
import { ActorType } from './model/entity/Actor';
import { ActorInputMapper } from './service/input/ActorInputMapper';
import { BehaviorInput } from './service/input/BehaviorInput';
import { ClassicInput } from './service/input/ClassicInput';
import { YamlParser } from './service/parser/YamlParser';
import { LineRender } from './service/render/LineRender';
import { LocalStateController } from './service/state/LocalStateController';
import { debugState } from './util/debug';

export async function main(args: Array<string>) {
  const logger = BunyanLogger.create({
    level: LogLevel.DEBUG,
    name: 'textual-engine',
  });
  logger.debug({
    args,
  }, 'text adventure');

  const render = new LineRender();

  // create DI container and services
  logger.debug({
    ClassicInput,
    YamlParser,
  }, 'starting services');
  const input = new ClassicInput();
  const inputMapper = new ActorInputMapper({
    [ActorType.DEFAULT]: new BehaviorInput(),
    [ActorType.PLAYER]: input,
    [ActorType.REMOTE]: input,
  });
  const parser = new YamlParser();
  const stateCtrl = new LocalStateController(inputMapper, logger);

  // load data files
  const dataStr = await promises.readFile(args[2], {
    encoding: 'utf-8',
  });
  const data = parser.load(dataStr);

  // create state from world
  const world = data.worlds.find((it) => it.meta.id === args[3]);
  if (isNil(world)) {
    logger.error('invalid world');
    exit(1);
  }

  const state = await stateCtrl.from(world, {
    rooms: 10,
    seed: '',
  });

  let turnCount = 0;
  let lastNow = Date.now();

  // while playing:
  while (true) {
    // wait for input
    const line = await render.read(`turn ${++turnCount} > `);
    if (line === 'quit') {
      await render.stop();
      break;
    }

    if (line === 'debug') {
      await debugState(render, state);
    }

    // parse last input
    const cmd = await input.parse(line);
    logger.debug({
      cmd,
    }, 'parsed command');

    // step world
    const now = Date.now();
    await stateCtrl.step(now - lastNow);
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
}

main(argv).then(() => {
  console.log('done');
}).catch((err) => {
  console.error('error in main', err);
});
