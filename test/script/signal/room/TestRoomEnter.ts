import { expect } from 'chai';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError.js';
import { makeCommand } from '../../../../src/model/Command.js';
import { SignalRoomEnter } from '../../../../src/script/signal/room/RoomEnter.js';
import { VERB_WAIT } from '../../../../src/util/constants.js';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../../entity.js';
import { createTestContext, getStubHelper, SinonStub } from '../../../helper.js';

describe('room enter signal', () => {
  it('should require the script target be a room', async () => {
    const context = createTestContext({
      command: makeCommand(VERB_WAIT),
      room: makeTestRoom('', '', '', [], []),
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

    expect(context.state.move).to.have.callCount(1).and.been.calledWith({
      moving: actor,
      source: room,
      target: room,
    });

    expect(actor.flags.get('scene-foo')).to.equal('shown');

    await SignalRoomEnter.call(room, context);

    expect(context.state.move).to.have.callCount(1);
  });
});
