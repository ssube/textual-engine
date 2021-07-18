import { expect } from 'chai';
import { createStubInstance } from 'sinon';

import { MathRandomService } from '../../../src/service/random/MathRandom';
import { JoinChain } from '../../../src/util/template/JoinChain';

describe('string join chain util', () => {
  it('should AND the first level', async () => {
    const chain = new JoinChain({
      joiners: ['-'],
      random: new MathRandomService(),
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
      random: new MathRandomService(),
    });

    const data = [
      'a', 'b', 'c',
    ];
    expect(chain.render(data)).to.equal('a-b-c');
  });

  it('should select the joiner by depth', async () => {
    const chain = new JoinChain({
      joiners: ['1', '2', '3', '4'],
      random: new MathRandomService(),
    });

    const data = [
      'a', [['m', 'n']], 'c',
    ];
    expect(chain.render(data)).to.equal('a1m3n1c');
  });

  it('should handle single strings at any level', async () => {
    const random = createStubInstance(MathRandomService);
    random.nextInt.returns(1);

    const chain = new JoinChain({
      joiners: ['-'],
      random,
    });

    const data = ['a', /* and */ ['b', /* or */ ['c', /* and */ ['d', /* or */ 'e']]]];
    expect(chain.render(data)).to.equal('a-c-e');
  });
});
