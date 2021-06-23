import { expect } from 'chai';
import { createStubInstance, match, SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { SignalRoomLook } from '../../../../src/script/signal/room/RoomLook';
import { MathRandomService } from '../../../../src/service/random/MathRandom';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { SIGNAL_LOOK, VERB_LOOK } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestPortal, makeTestRoom } from '../../../entity';
import { createTestContext, getStubHelper } from '../../../helper';

describe('room look scripts', () => {
  it('should require the script target be a room', async () => {
    const stateHelper = getStubHelper();

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      random: createStubInstance(MathRandomService),
      room: makeTestRoom('', '', '', [], []),
      state: stateHelper,
    });

    await expect(SignalRoomLook.call(makeTestActor('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalRoomLook.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should describe the room', async () => {
    const script = createStubInstance(LocalScriptService);
    const stateHelper = getStubHelper();

    const room = makeTestRoom('', '', '', [], []);
    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      random: createStubInstance(MathRandomService),
      room,
      script,
      state: stateHelper,
    });

    await SignalRoomLook.call(room, context);

    expect(stateHelper.show).to.have.been.calledWithMatch(match.object, 'actor.step.look.room.seen');
  });

  it('should describe actors in the room', async () => {
    const script = createStubInstance(LocalScriptService);
    const state = getStubHelper();

    const actor = makeTestActor('', '', '');
    const room = makeTestRoom('', '', '', [actor], []);

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      random: createStubInstance(MathRandomService),
      room,
      script,
      state,
    });

    await SignalRoomLook.call(room, context);

    expect(script.invoke).to.have.been.calledWithMatch(actor, SIGNAL_LOOK, match.object);
  });

  it('should describe items in the room', async () => {
    const script = createStubInstance(LocalScriptService);
    const state = getStubHelper();

    const item = makeTestItem('', '', '');
    const room = makeTestRoom('', '', '', [], [item]);

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      random: createStubInstance(MathRandomService),
      room,
      script,
      state,
    });

    await SignalRoomLook.call(room, context);

    expect(script.invoke).to.have.been.calledWithMatch(item, SIGNAL_LOOK, match.object);
  });

  it('should describe portals in the room', async () => {
    const script = createStubInstance(LocalScriptService);
    const state = getStubHelper();

    const room = makeTestRoom('', '', '', [], []);
    const portal = makeTestPortal('', 'door', 'west', 'east', 'foo');
    room.portals.push(portal);

    (state.find as SinonStub).returns(Promise.resolve([room]));

    const context = createTestContext({
      command: makeCommand(VERB_LOOK),
      random: createStubInstance(MathRandomService),
      room,
      script,
      state,
    });

    await SignalRoomLook.call(room, context);

    expect(script.invoke).to.have.been.calledWith(portal, SIGNAL_LOOK);
  });
});
