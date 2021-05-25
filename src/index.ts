import { argv } from 'process';

import { main } from './main';

main(argv).then((exitCode: number) => {
  // eslint-disable-next-line no-console
  console.log('main exited %s', exitCode);
  process.exitCode = exitCode;
}).catch((err) => {
  // eslint-disable-next-line no-console
  console.error('error in main', err);
  process.exitCode = 1;
});
