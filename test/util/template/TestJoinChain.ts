import { expect } from 'chai';

import { MathRandomGenerator } from '../../../src/service/random/MathRandom';
import { JoinChain } from '../../../src/util/template/JoinChain';

describe('string join chain util', () => {
  it('should AND the first level', async () => {
    const chain = new JoinChain({
      joiners: ['-'],
      random: new MathRandomGenerator(),
    });

    const data = [
      'a', 'b', 'c',
    ];

    for (const c of data) {
      expect(chain.render(data)).to.include(c);
    }
  });

  it('should OR the second level', async () => {
    const chain = new JoinChain({
      joiners: ['-'],
      random: new MathRandomGenerator(),
    });

    const data = [
      'a', 'b', 'c',
    ];
    expect(chain.render(data)).to.equal('a-b-c');
  });

  it('should select the joiner by depth', async () => {
    const chain = new JoinChain({
      joiners: ['1', '2', '3', '4'],
      random: new MathRandomGenerator(),
    });

    const data = [
      'a', [['m', 'n']], 'c',
    ];
    expect(chain.render(data)).to.equal('a1m3n1c');
  });
});
