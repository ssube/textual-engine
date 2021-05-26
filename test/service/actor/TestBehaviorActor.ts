import { expect } from 'chai';
import { Container, NullLogger } from 'noicejs';

import { LocalModule } from '../../../src/module/LocalModule';
import { BehaviorActorService } from '../../../src/service/actor/BehaviorActor';
import { VERB_WAIT } from '../../../src/util/constants';

describe('behavior actor', () => {
  it('should always wait for the next turn', async () => {
    const container = Container.from(new LocalModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const actor = await container.create(BehaviorActorService, {
      actor: 'foo',
    });

    expect(await actor.last()).to.deep.equal({
      index: 0,
      input: `${VERB_WAIT} turn`,
      target: 'turn',
      verb: VERB_WAIT,
    });
  });
});
