import { expect } from 'chai';
import { Container } from 'noicejs';

import { AleaRandomService } from '../../../src/service/random/AleaRandom';

describe('alea random generator', () => {
  it('should generate random integers', async () => {
    const container = Container.from();
    await container.configure();

    const random = await container.create(AleaRandomService);
    expect(random.nextInt()).to.be.greaterThan(0);
  });

  it('should generate random floats', async () => {
    const container = Container.from();
    await container.configure();

    const random = await container.create(AleaRandomService);
    expect(random.nextFloat()).to.be.greaterThan(0);
  });

  it('should generate the same value from the same seed', async () => {
    const container = Container.from();
    await container.configure();

    const random = await container.create(AleaRandomService);

    random.reseed('foo');
    const first = [
      random.nextFloat(),
      random.nextFloat(),
    ];

    random.reseed('foo');
    const next = [
      random.nextFloat(),
      random.nextFloat(),
    ];

    expect(first).to.deep.equal(next);
  });

  it('should return constant integer values when next min equals max', async () => {
    const container = Container.from();
    await container.configure();

    const random = await container.create(AleaRandomService);

    for (let i = 0; i < 1_000; ++i) {
      const value = random.nextInt();
      expect(random.nextInt(value, value)).to.equal(value);
    }
  });
});
