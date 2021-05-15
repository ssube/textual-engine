import { expect } from "chai";
import { splitChain } from "../../../src/util/template/SplitChain";

describe('group chain split helper', () => {
  it('should split groups', async () => {
    expect(splitChain('(a|(b|c)|d)', {
      group: {
        start: '(',
        end: ')',
      },
      split: '|',
    })).to.deep.equal(['a', ['b', 'c'], 'd']);
  });
});
