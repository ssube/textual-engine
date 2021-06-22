import { expect } from 'chai';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { VerbActorWait } from '../../../../src/script/verb/actor/ActorWait';
import { VERB_WAIT } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity';
import { createTestContext } from '../../../helper';

describe('actor wait scripts', () => {
  describe('actor wait command', () => {
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
});
