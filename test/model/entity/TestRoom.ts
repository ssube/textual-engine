import { expect } from 'chai';

import { isRoom, ROOM_TYPE } from '../../../src/model/entity/Room.js';

describe('item entity model', () => {
  it('should guard on the entity type', async () => {
    expect(isRoom({
      type: ROOM_TYPE,
      meta: {
        desc: '',
        id: '',
        name: '',
        template: '',
      },
    })).to.equal(true);
  });
});
