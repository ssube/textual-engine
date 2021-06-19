import { expect } from 'chai';
import { NullLogger } from 'noicejs';
import { createStubInstance, match, SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { SignalRoomLook } from '../../../../src/script/signal/room/RoomLook';
import { MathRandomGenerator } from '../../../../src/service/random/MathRandom';
import { ScriptContext } from '../../../../src/service/script';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { SIGNAL_LOOK, VERB_LOOK } from '../../../../src/util/constants';
import { makeTestActor, makeTestItem, makeTestPortal, makeTestRoom } from '../../../entity';
import { getStubHelper } from '../../../helper';
import { testTransfer } from '../../helper';

describe('room look scripts', () => {
  it('should require the script target be a room', async () => {
    const script = createStubInstance(LocalScriptService);
    const stateHelper = getStubHelper();
    const transfer = testTransfer();

    const context: ScriptContext = {
      command: makeCommand(VERB_LOOK, ''),
      data: new Map(),
      logger: NullLogger.global,
      random: createStubInstance(MathRandomGenerator),
      room: makeTestRoom('', '', '', [], []),
      script,
      state: stateHelper,
      transfer,
    };

    await expect(SignalRoomLook.call(makeTestActor('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    await expect(SignalRoomLook.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
  });

  it('should describe the room', async () => {
    const script = createStubInstance(LocalScriptService);
    const stateHelper = getStubHelper();
    const transfer = testTransfer();

    const room = makeTestRoom('', '', '', [], []);
    const context: ScriptContext = {
      command: makeCommand(VERB_LOOK, ''),
      data: new Map(),
      logger: NullLogger.global,
      random: createStubInstance(MathRandomGenerator),
      room,
      script,
      state: stateHelper,
      transfer,
    };

    await SignalRoomLook.call(room, context);

    expect(stateHelper.show).to.have.been.calledWith('actor.step.look.room.seen');
  });

  it('should describe actors in the room', async () => {
    const script = createStubInstance(LocalScriptService);
    const stateHelper = getStubHelper();
    const transfer = testTransfer();

    const actor = makeTestActor('', '', '');
    const room = makeTestRoom('', '', '', [actor], []);

    const context: ScriptContext = {
      command: makeCommand(VERB_LOOK, ''),
      data: new Map(),
      logger: NullLogger.global,
      random: createStubInstance(MathRandomGenerator),
      room,
      script,
      state: stateHelper,
      transfer,
    };

    await SignalRoomLook.call(room, context);

    expect(script.invoke).to.have.been.calledWithMatch(actor, SIGNAL_LOOK, match.object);
  });

  it('should describe items in the room', async () => {
    const script = createStubInstance(LocalScriptService);
    const stateHelper = getStubHelper();
    const transfer = testTransfer();

    const item = makeTestItem('', '', '');
    const room = makeTestRoom('', '', '', [], [item]);

    const context: ScriptContext = {
      command: makeCommand(VERB_LOOK, ''),
      data: new Map(),
      logger: NullLogger.global,
      random: createStubInstance(MathRandomGenerator),
      room,
      script,
      state: stateHelper,
      transfer,
    };

    await SignalRoomLook.call(room, context);

    expect(script.invoke).to.have.been.calledWithMatch(item, SIGNAL_LOOK, match.object);
  });

  it('should describe portals in the room', async () => {
    const script = createStubInstance(LocalScriptService);
    const stateHelper = getStubHelper();
    const transfer = testTransfer();

    const room = makeTestRoom('', '', '', [], []);
    const portal = makeTestPortal('', 'door', 'west', 'east', 'foo');
    room.portals.push(portal);

    (stateHelper.find as SinonStub).returns(Promise.resolve([room]));

    const context: ScriptContext = {
      command: makeCommand(VERB_LOOK, ''),
      data: new Map(),
      logger: NullLogger.global,
      random: createStubInstance(MathRandomGenerator),
      room,
      script,
      state: stateHelper,
      transfer,
    };

    await SignalRoomLook.call(room, context);

    expect(script.invoke).to.have.been.calledWith(portal, SIGNAL_LOOK);
  });
});
