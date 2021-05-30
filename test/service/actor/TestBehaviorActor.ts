import { expect } from 'chai';
import { Container, NullLogger } from 'noicejs';

import { CoreModule } from '../../../src/module/CoreModule';
import { BehaviorActorService } from '../../../src/service/actor/BehaviorActor';
import { VERB_WAIT } from '../../../src/util/constants';

describe('behavior actor', () => {
  // TODO: switch to events
  xit('should always wait for the next turn', async () => {
    const container = Container.from(new CoreModule());
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
