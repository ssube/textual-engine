import { expect } from 'chai';
import { createStubInstance, SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { SignalRoomEnter } from '../../../../src/script/signal/room/RoomEnter';
import { MathRandomService } from '../../../../src/service/random/MathRandom';
import { VERB_WAIT } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity';
import { createTestContext, getStubHelper } from '../../../helper';

describe('room enter signal', () => {
  it('should require the script target be a room', async () => {
    const state = getStubHelper();

    const context = createTestContext({
      command: makeCommand(VERB_WAIT),
      random: createStubInstance(MathRandomService),
      room: makeTestRoom('', '', '', [], []),
      state,
    });

    await expect(SignalRoomEnter.call(makeTestActor('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalRoomEnter.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should move the actor into a cutscene if they have not seen it', async () => {
    const actor = makeTestActor('', '', '');
    const room = makeTestRoom('foo', '', '', [], []);
    room.flags.set('scene', 'bar');

    const state = getStubHelper();
    (state.find as SinonStub).resolves([room]);

    const context = createTestContext({
      actor,
      command: makeCommand(VERB_WAIT),
      room,
      state,
    });

    await SignalRoomEnter.call(room, context);

    expect(context.state.move).to.have.been.calledWith({
      moving: actor,
      source: room,
      target: room,
    });

    expect(actor.flags.get('scene-foo')).to.equal('shown');
  });
});
