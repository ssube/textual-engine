/* istanbul ignore file */

import { argv } from 'process';

import { main } from './main.js';

main(argv).then((exitCode: number) => {
  process.exitCode = exitCode;
}).catch((err) => {
  // eslint-disable-next-line no-console
  console.error('error in main', err);
  process.exitCode = 1;
});
