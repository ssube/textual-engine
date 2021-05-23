import { NotImplementedError } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { Container } from 'noicejs';

import { LocalModule } from '../../../src/module/LocalModule';
import { BehaviorInput } from '../../../src/service/input/BehaviorInput';
import { VERB_WAIT } from '../../../src/util/constants';

describe('behavior input', () => {
  it('should always wait for the next turn', async () => {
    const container = Container.from(new LocalModule());
    await container.configure();

    const input = await container.create(BehaviorInput);

    expect(await input.parse('')).to.deep.equal({
      index: 0,
      input: `${VERB_WAIT} turn`,
      target: 'turn',
      verb: VERB_WAIT,
    });
  });

  it('should not implement tokenize', async () => {
    const container = Container.from(new LocalModule());
    await container.configure();

    const input = await container.create(BehaviorInput);

    return expect(input.tokenize('')).to.eventually.be.rejectedWith(NotImplementedError);
  });

  it('should not implement translate', async () => {
    const container = Container.from(new LocalModule());
    await container.configure();

    const input = await container.create(BehaviorInput);

    return expect(input.translate([])).to.eventually.be.rejectedWith(NotImplementedError);
  });
});
