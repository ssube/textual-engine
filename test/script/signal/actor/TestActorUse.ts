import { expect } from 'chai';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError.js';
import { makeCommand } from '../../../../src/model/Command.js';
import { SignalActorUse } from '../../../../src/script/signal/actor/ActorUse.js';
import { MathRandomService } from '../../../../src/service/random/MathRandom.js';
import { STAT_DAMAGE, STAT_HEALTH, VERB_WAIT } from '../../../../src/util/constants.js';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity.js';
import { createTestContext, getStubHelper } from '../../../helper.js';

describe('actor use signal', () => {
  it('should require the script target be an actor', async () => {
    const state = getStubHelper();

    const context = createTestContext({
      command: makeCommand(VERB_WAIT),
      room: makeTestRoom('', '', '', [], []),
      state,
    });

    await expect(SignalActorUse.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalActorUse.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should apply damage from the item being used', async () => {
    const state = getStubHelper();

    const item = makeTestItem('', '', '');
    item.stats.set(STAT_DAMAGE, 10);

    const actor = makeTestActor('', '', '');
    actor.stats.set(STAT_HEALTH, 20);

    const context = createTestContext({
      command: makeCommand(VERB_WAIT),
      item,
      random: new MathRandomService(),
      state,
    });

    await SignalActorUse.call(actor, context);

    expect(actor.stats.get(STAT_HEALTH)).to.be.lessThan(20);
  });

  it('should apply health from the item being used', async () => {
    const state = getStubHelper();

    const item = makeTestItem('', '', '');
    item.stats.set(STAT_HEALTH, 10);

    const actor = makeTestActor('', '', '');
    actor.stats.set(STAT_HEALTH, 20);

    const context = createTestContext({
      command: makeCommand(VERB_WAIT),
      item,
      random: new MathRandomService(),
      state,
    });

    await SignalActorUse.call(actor, context);

    expect(actor.stats.get(STAT_HEALTH)).to.be.greaterThan(20);
  });
});
