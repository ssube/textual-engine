/* istanbul ignore file */

import { main } from './main';

const args = [
  '--config',
  'page://data-config',
  '--data',
  'https://raw.githubusercontent.com/ssube/textual-engine/master/data/demo.yml',
  '--data',
  'https://raw.githubusercontent.com/ssube/textual-engine/master/data/samples/alice.yml',
  '--data',
  'https://raw.githubusercontent.com/ssube/textual-engine/master/data/samples/dracula.yml',
  '--data',
  'https://raw.githubusercontent.com/ssube/textual-engine/master/data/samples/hansel-and-gretel.yml',
  '--data',
  'https://raw.githubusercontent.com/ssube/textual-engine/master/data/samples/red-riding-hood.yml',
  '--module',
  'core',
  '--module',
  'browser',
  '--input',
  'create a test with test and with 20',
  '--input',
  'help',
];

const query = new URLSearchParams(window.location.search);
query.forEach((value, key) => {
  args.push(`--${key}`, value);
});

main(args).then((exitCode) => {
  // eslint-disable-next-line no-console
  console.log('main exited with status', exitCode);
}).catch((err) => {
  // eslint-disable-next-line no-console
  console.error('main exited with uncaught error', err);
});
