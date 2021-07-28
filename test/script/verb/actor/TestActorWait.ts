import { expect } from 'chai';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError.js';
import { makeCommand } from '../../../../src/model/Command.js';
import { VerbActorWait } from '../../../../src/script/verb/actor/ActorWait.js';
import { VERB_WAIT } from '../../../../src/util/constants.js';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity.js';
import { createTestContext } from '../../../helper.js';

describe('actor wait verb', () => {
  it('should require the script target be an actor', async () => {
    const context = createTestContext({
      command: makeCommand(VERB_WAIT),
      room: makeTestRoom('', '', '', [], []),
    });

    await expect(VerbActorWait.call(makeTestActor('', '', ''), context)).to.eventually.equal(undefined);
    await expect(VerbActorWait.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(VerbActorWait.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });
});
