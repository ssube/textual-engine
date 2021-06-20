/* istanbul ignore file */

import { main } from './main';

main([
  '--config',
  'page://data-config',
  '--data',
  'https://raw.githubusercontent.com/ssube/textual-engine/master/data/demo.yml',
  '--module',
  'core',
  '--module',
  'browser',
  '--input',
  'create test test 5',
  '--input',
  'help',
]).then((exitCode) => {
  // eslint-disable-next-line no-console
  console.log('main exited with status', exitCode);
}).catch((err) => {
  // eslint-disable-next-line no-console
  console.error('main exited with uncaught error', err);
});
