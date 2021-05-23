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
});
