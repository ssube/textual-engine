import { expect } from 'chai';
import { Container } from 'noicejs';

import { SeedRandomGenerator } from '../../../src/service/random/SeedRandom';

describe('seed random generator', () => {
  it('should generate random integers', async () => {
    const container = Container.from();
    await container.configure();

    const random = await container.create(SeedRandomGenerator);
    expect(random.nextInt()).to.be.greaterThan(0);
  });

  it('should generate random floats', async () => {
    const container = Container.from();
    await container.configure();

    const random = await container.create(SeedRandomGenerator);
    expect(random.nextFloat()).to.be.greaterThan(0);
  });

  it('should generate the same value from the same seed', async () => {
    const container = Container.from();
    await container.configure();

    const random = await container.create(SeedRandomGenerator);

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
});
