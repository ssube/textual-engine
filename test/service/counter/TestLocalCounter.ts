import { expect } from 'chai';
import { Container, NullLogger } from 'noicejs';

import { LocalModule } from '../../../src/module/LocalModule';
import { LocalCounter } from '../../../src/service/counter/LocalCounter';

describe('local counter', () => {
  it('should issue consecutive IDs', async () => {
    const container = Container.from(new LocalModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const counter = await container.create(LocalCounter);

    const first = counter.next('foo');
    const second = counter.next('foo');

    expect(second).to.equal(first + 1);
  });
});
