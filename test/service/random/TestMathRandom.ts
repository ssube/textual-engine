import { expect } from 'chai';
import { Container } from 'noicejs';

import { MathRandomService } from '../../../src/service/random/MathRandom';

describe('math random generator', () => {
  it('should generate random integers', async () => {
    const container = Container.from();
    await container.configure();

    const random = await container.create(MathRandomService);
    expect(random.nextInt()).to.be.greaterThan(0);
  });

  it('should generate random floats', async () => {
    const container = Container.from();
    await container.configure();

    const random = await container.create(MathRandomService);
    expect(random.nextFloat()).to.be.greaterThan(0);
  });

  xit('should not reseed');
});
