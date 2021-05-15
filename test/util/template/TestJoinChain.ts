import { expect } from 'chai';

import { MathRandomGenerator } from '../../../src/service/random/MathRandom';
import { JoinChain } from '../../../src/util/template/JoinChain';

describe('string join chain util', () => {
  it('should OR the first level', async () => {
    const chain = new JoinChain({
      joiners: ['-'],
      random: new MathRandomGenerator(),
    });

    const data = [
      'a', 'b', 'c',
    ];
    expect(data).to.include(chain.render(data));
  });

  it('should AND the second level', async () => {
    const chain = new JoinChain({
      joiners: ['-'],
      random: new MathRandomGenerator(),
    });

    const data = [[
      'a', 'b', 'c',
    ]];
    expect(chain.render(data)).to.equal('a-b-c');
  });

  it('should select the joiner by depth', async () => {
    const chain = new JoinChain({
      joiners: ['1', '2', '3', '4'],
      random: new MathRandomGenerator(),
    });

    const data = [[
      'a', [['m', 'n']], 'c',
    ]];
    expect(chain.render(data)).to.equal('a2m4n2c');
  });
});
