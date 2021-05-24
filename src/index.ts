import { argv } from 'process';

import { main } from './main';

main(argv).then((exitCode: number) => {
  console.log('main exited %s', exitCode);
  process.exitCode = exitCode;
}).catch((err) => {
  console.error('error in main', err);
  process.exitCode = 1;
});
