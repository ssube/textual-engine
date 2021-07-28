import { expect } from 'chai';
import { Container, NullLogger } from 'noicejs';

import { CoreModule } from '../../../src/module/CoreModule.js';
import { LocalCounter } from '../../../src/service/counter/LocalCounter.js';

describe('local counter', () => {
  it('should issue consecutive IDs', async () => {
    const container = Container.from(new CoreModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const counter = await container.create(LocalCounter);

    const first = counter.next('foo');
    const second = counter.next('foo');

    expect(second).to.equal(first + 1);
  });
});
