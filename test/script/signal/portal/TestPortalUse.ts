import { expect } from 'chai';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError.js';
import { makeCommand } from '../../../../src/model/Command.js';
import { SignalPortalUse } from '../../../../src/script/signal/portal/PortalUse.js';
import { MathRandomService } from '../../../../src/service/random/MathRandom.js';
import { STAT_LOCKED, VERB_WAIT } from '../../../../src/util/constants.js';
import { makeTestItem, makeTestPortal, makeTestRoom } from '../../../entity.js';
import { createTestContext } from '../../../helper.js';

describe('portal use signal', () => {
  it('should require the script target be a portal', async () => {
    const context = createTestContext({
      command: makeCommand(VERB_WAIT),
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

  it('should show a generic message if the item is not a key', async () => {
    const item = makeTestItem('', '', '');

    const portal = makeTestPortal('foo-1', '', '', '', '');
    portal.stats.set(STAT_LOCKED, 1);

    const context = createTestContext({
      command: makeCommand(VERB_WAIT),
      item,
      random: new MathRandomService(),
    });

    await SignalPortalUse.call(portal, context);

    expect(context.state.show).to.have.been.calledWith(context.source, 'portal.use.any');
  });
});
