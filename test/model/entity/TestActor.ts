import { expect } from 'chai';

import { ACTOR_TYPE, isActor } from '../../../src/model/entity/Actor';

describe('actor entity model', () => {
  it('should guard on the entity type', async () => {
    expect(isActor({
      type: ACTOR_TYPE,
      meta: {
        desc: '',
        id: '',
        name: '',
        template: '',
      },
    })).to.equal(true);
  });
});
