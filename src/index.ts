import { isNil } from '@apextoaster/js-utils';
import { promises } from 'fs';
import { LogLevel } from 'noicejs';
import { argv, exit, stdin, stdout } from 'process';
import { createInterface } from 'readline';

import { BunyanLogger } from './logger/BunyanLogger';
import { ActorType } from './model/entity/Actor';
import { ActorInputMapper } from './service/input/ActorInputMapper';
import { BehaviorInput } from './service/input/BehaviorInput';
import { ClassicInput } from './service/input/ClassicInput';
import { YamlParser } from './service/parser/YamlParser';
import { LocalStateController } from './service/state/LocalStateController';

export async function main(args: Array<string>) {
  const logger = BunyanLogger.create({
    level: LogLevel.DEBUG,
    name: 'textual-engine',
  });
  logger.debug({
    args,
  }, 'text adventure');

  const rl = createInterface({
    input: stdin,
    output: stdout,
    prompt: '> ',
  });

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

  stateCtrl.from(world, {
    rooms: 10,
    seed: '',
  });

  let turnCount = 0;
  let lastNow = Date.now();
  // while playing:
  rl.setPrompt(`turn ${turnCount} > `);
  rl.prompt();
  for await (const line of rl) {
    await stateCtrl.next();

    // parse last input
    const cmd = await input.parse(line);
    logger.debug({
      cmd,
    }, 'parsed command');

    // step world
    const now = Date.now();
    await stateCtrl.step(now - lastNow);
    lastNow = now;

    // wait for input
    rl.setPrompt(`turn ${++turnCount} > `);
    rl.prompt()
  }

  const state = await stateCtrl.save();
  console.dir(parser.save({
    saves: [{
      state,
    }],
    worlds: [],
  }));
}

main(argv).then(() => {
  console.log('done');
}).catch((err) => {
  console.error('error in main', err);
});
