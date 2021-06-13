import { NotImplementedError } from '@apextoaster/js-utils';
import { expect } from 'chai';

import { CoreModule } from '../../../src/module/CoreModule';
import { NaturalTokenizer } from '../../../src/service/tokenizer/NaturalTokenizer';
import { getTestContainer } from '../../helper';

describe('natural tokenizer', () => {
  it('should not implement any methods yet', async () => {
    const container = await getTestContainer(new CoreModule());
    const token = await container.create(NaturalTokenizer);

    await expect(token.parse('')).to.eventually.be.rejectedWith(NotImplementedError);
    await expect(token.split('')).to.eventually.be.rejectedWith(NotImplementedError);
    await expect(token.translate([''])).to.eventually.be.rejectedWith(NotImplementedError);
  });
});
