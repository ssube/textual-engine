import { main } from './main';

main([
  '--config',
  'data-config',
  '--data',
  'data-world',
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
  console.log('main exited with status', exitCode);
}).catch((err) => {
  console.error('main exited with uncaught error', err);
});
