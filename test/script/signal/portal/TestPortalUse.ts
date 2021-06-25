import { expect } from 'chai';
import { createStubInstance } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { SignalPortalUse } from '../../../../src/script/signal/portal/PortalUse';
import { MathRandomService } from '../../../../src/service/random/MathRandom';
import { STAT_LOCKED, VERB_WAIT } from '../../../../src/util/constants';
import { makeTestItem, makeTestPortal, makeTestRoom } from '../../../entity';
import { createTestContext } from '../../../helper';

describe('portal use signal', () => {
  it('should require the script target be a portal', async () => {
    const context = createTestContext({
      command: makeCommand(VERB_WAIT),
      random: createStubInstance(MathRandomService),
      room: makeTestRoom('', '', '', [], []),
    });

    await expect(SignalPortalUse.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalPortalUse.call(makeTestRoom('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should unlock if the item being used is a key for this room', async () => {
    const item = makeTestItem('', '', '');
    item.flags.set('key', 'foo');

    const portal = makeTestPortal('foo-1', '', '', '', '');
    portal.stats.set(STAT_LOCKED, 1);

    const context = createTestContext({
      command: makeCommand(VERB_WAIT),
      item,
      random: new MathRandomService(),
    });

    await SignalPortalUse.call(portal, context);

    expect(portal.stats.get(STAT_LOCKED)).to.equal(0);
  });

  it('should remain locked if the item being used is the wrong key', async () => {
    const item = makeTestItem('', '', '');
    item.flags.set('key', 'bars');

    const portal = makeTestPortal('foo-1', '', '', '', '');
    portal.stats.set(STAT_LOCKED, 1);

    const context = createTestContext({
      command: makeCommand(VERB_WAIT),
      item,
      random: new MathRandomService(),
    });

    await SignalPortalUse.call(portal, context);

    expect(portal.stats.get(STAT_LOCKED)).to.equal(1);
  });
});
