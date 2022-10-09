import { expect } from 'chai';

import { isItem, ITEM_TYPE } from '../../../src/model/entity/Item.js';

describe('item entity model', () => {
  it('should guard on the entity type', async () => {
    expect(isItem({
      type: ITEM_TYPE,
      meta: {
        desc: '',
        id: '',
        name: '',
        template: '',
      },
    })).to.equal(true);
  });
});
