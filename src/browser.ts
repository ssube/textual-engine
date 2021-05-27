import { main } from './main';

main([
  '--config',
  'data-config',
  '--data',
  'https://raw.githubusercontent.com/ssube/textual-engine/master/data/base.yml',
  '--module',
  'local',
  '--module',
  'input',
  '--module',
  'browser',
  '--seed',
  'test',
  '--world',
  'test',
]).then((exitCode) => {
  // eslint-disable-next-line no-console
  console.log('main exited with status', exitCode);
}).catch((err) => {
  // eslint-disable-next-line no-console
  console.error('main exited with uncaught error', err);
});
