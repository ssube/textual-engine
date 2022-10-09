import { expect } from 'chai';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError.js';
import { CoreModule } from '../../../../src/lib.js';
import { makeCommand } from '../../../../src/model/Command.js';
import { VerbActorLook } from '../../../../src/script/verb/actor/ActorLook.js';
import { LocalScriptService } from '../../../../src/service/script/LocalScript.js';
import { SIGNAL_LOOK, STAT_HEALTH, VERB_LOOK } from '../../../../src/util/constants.js';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity.js';
import { createStubInstance, createTestContext, getStubHelper, getTestContainer, match, SinonStub } from '../../../helper.js';

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

      await VerbActorLook.call(makeTestActor('', '', '', makeTestItem('', '', '')), context);

      expect(script.invoke).to.have.been.calledWithMatch(room, SIGNAL_LOOK, match.object);
    });

    it('should not include the player', async () => {
      const container = await getTestContainer(new CoreModule());
      const state = getStubHelper();

      const actor = makeTestActor('', '', '');
      actor.scripts.set(SIGNAL_LOOK, {
        data: new Map(),
        name: 'signal-actor-look',
      });
      actor.stats.set(STAT_HEALTH, 5);

      const room = makeTestRoom('', '', '', [actor], []);
      room.scripts.set(SIGNAL_LOOK, {
        data: new Map(),
        name: 'signal-room-look',
      });

      const context = createTestContext({
        command: makeCommand(VERB_LOOK),
        room,
        state,
        script: await container.create(LocalScriptService),
      });

      await VerbActorLook.call(actor, context);

      expect(state.show).to.have.callCount(3);
      expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.signal.look.self');
      expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.signal.look.health');
      expect(state.show).to.have.been.calledWithMatch(match.object, 'room.signal.look.seen');
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

      expect(state.show).to.have.been.calledWithMatch(match.object, 'actor.verb.look.missing');
      expect(script.invoke).to.have.callCount(0);
    });
  });
});
