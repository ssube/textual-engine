import { InvalidArgumentError } from '@apextoaster/js-utils';
import { expect } from 'chai';

import { main } from '../src/main.js';
import { META_QUIT } from '../src/util/constants.js';

describe('main entry point', () => {
  it('should throw when invalid modules are requested', async () => expect(main([
    '--config',
    'data/test.yml',
    '--module',
    'invalid',
  ])).to.eventually.be.rejectedWith(InvalidArgumentError));

  it('should exit when quit is given as an input', async () => expect(main([
    '--config',
    'data/test.yml',
    '--data',
    'file://data/demo.yml',
    '--input',
    META_QUIT,
  ])).to.eventually.equal(0));
});
