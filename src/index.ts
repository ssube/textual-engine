import { promises } from 'fs';
import { argv, exit, stdin, stdout } from 'process';
import { createInterface } from 'readline';

import { ClassicInput } from './service/input/ClassicInput';
import { YamlParser } from './service/parser/YamlParser';
import { LocalStateController } from './service/state/LocalStateController';

export async function main(args: Array<string>) {
  console.log('text adventure', args);

  const rl = createInterface({
    input: stdin,
    output: stdout,
    prompt: '> ',
  });

  // create DI container and services
  console.log(ClassicInput, YamlParser);
  const input = new ClassicInput();
  const parser = new YamlParser();
  const stateCtrl = new LocalStateController();

  // load data files
  const dataStr = await promises.readFile(args[2], {
    encoding: 'utf-8',
  });
  const data = parser.load(dataStr);

  // create state from world
  const world = data.worlds.find((it) => it.meta.id === args[3]);
  if (world === null || world === undefined) {
    console.log('invalid world');
    exit(1);
  }

  stateCtrl.from(world, {
    rooms: 10,
    seed: '',
  });

  let lastNow = Date.now();
  // while playing:
  rl.prompt();
  for await (const line of rl) {
    await stateCtrl.next();

    // take input
    const cmd = await input.parse(line);
    console.log(cmd);

    // step world
    const now = Date.now();
    stateCtrl.step(now - lastNow);
    lastNow = now;

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

main(argv).then(() => console.log('done')).catch((err) => console.error('error in main', err));
