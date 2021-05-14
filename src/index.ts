import { isNil } from '@apextoaster/js-utils';
import { promises } from 'fs';
import { BaseOptions, Container, LogLevel } from 'noicejs';
import { argv, exit } from 'process';

import { BunyanLogger } from './logger/BunyanLogger';
import { ActorType } from './model/entity/Actor';
import { INJECT_INPUT_PLAYER } from './module';
import { LocalModule } from './module/LocalModule';
import { Input } from './service/input';
import { BehaviorInput } from './service/input/BehaviorInput';
import { YamlParser } from './service/parser/YamlParser';
import { LineRender } from './service/render/LineRender';
import { LocalStateController } from './service/state/LocalStateController';
import { debugState } from './util/debug';

export async function main(args: Array<string>) {
  const logger = BunyanLogger.create({
    level: LogLevel.INFO,
    name: 'textual-engine',
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
  const input = await container.create<Input, BaseOptions>(INJECT_INPUT_PLAYER);
  const parser = await container.create(YamlParser);
  const render = await container.create(LineRender);
  const stateCtrl = await container.create(LocalStateController);

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
    seed: args[4],
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
