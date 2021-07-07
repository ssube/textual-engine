import { expect } from 'chai';
import { createStubInstance, match, SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { VerbActorLook } from '../../../../src/script/verb/actor/ActorLook';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { SIGNAL_LOOK, VERB_LOOK } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity';
import { createTestContext, getStubHelper } from '../../../helper';

describe('actor look verb', () => {
  describe('actor look verb without a target', () => {
    it('should require the script target be an actor', async () => {
      const context = createTestContext({
        command: makeCommand(VERB_LOOK),
        room: makeTestRoom('', '', '', [], []),
      });

      await expect(VerbActorLook.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
      await expect(VerbActorLook.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    });

    it('should describe the room', async () => {
      const script = createStubInstance(LocalScriptService);
      const state = getStubHelper();

      const room = makeTestRoom('', '', '', [], []);
      const context = createTestContext({
        command: makeCommand(VERB_LOOK),
        room,
        script,
        state,
      });

      await VerbActorLook.call(makeTestActor('', '', ''), context);

      expect(script.invoke).to.have.been.calledWithMatch(room, SIGNAL_LOOK, match.object);
    });

    it('should not include the player when looking at a target', async () => {
      const state = getStubHelper();

      const actor = makeTestActor('', '', '');
      const context = createTestContext({
        command: makeCommand(VERB_LOOK),
        room: makeTestRoom('', '', '', [actor], []),
        state,
      });

      await VerbActorLook.call(actor, context);

      expect(state.show).to.have.callCount(2);
      expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.step.look.room.you');
      expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.step.look.room.health');
    });
  });

  describe('actor look verb with target', () => {
    it('should describe the target', async () => {
      const script = createStubInstance(LocalScriptService);
      const state = getStubHelper();

      const actor = makeTestActor('bar', '', '');
      const room = makeTestRoom('foo', '', '', [actor], []);
      (state.find as SinonStub).resolves([actor]);

      const context = createTestContext({
        command: makeCommand(VERB_LOOK, actor.meta.id),
        room,
        script,
        state,
      });

      await VerbActorLook.call(actor, context);

      expect(script.invoke).to.have.been.calledWithMatch(actor, SIGNAL_LOOK, match.object);
    });

    it('should warn when the target does not exist', async () => {
      const script = createStubInstance(LocalScriptService);
      const state = getStubHelper();
      (state.find as SinonStub).resolves([]);

      const actor = makeTestActor('bar', '', '');
      const room = makeTestRoom('foo', '', '', [actor], []);

      const context = createTestContext({
        command: makeCommand(VERB_LOOK, 'none'),
        room,
        script,
        state,
      });

      await VerbActorLook.call(actor, context);

      expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.step.look.none');
      expect(script.invoke).to.have.callCount(0);
    });
  });
});
