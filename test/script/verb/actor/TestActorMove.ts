import { NotFoundError } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { NullLogger } from 'noicejs';
import { createStubInstance, SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { ActorSource } from '../../../../src/model/entity/Actor';
import { ROOM_TYPE } from '../../../../src/model/entity/Room';
import { VerbActorMove } from '../../../../src/script/verb/ActorMove';
import { MathRandomGenerator } from '../../../../src/service/random/MathRandom';
import { ScriptContext } from '../../../../src/service/script';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { VERB_MOVE, VERB_WAIT } from '../../../../src/util/constants';
import { makeTestActor, makeTestCommand, makeTestItem, makeTestPortal, makeTestRoom } from '../../../entity';
import { getStubHelper } from '../../../helper';
import { testTransfer } from '../../helper';

describe('actor move scripts', () => {
  describe('actor move command', () => {
    it('should require the script target be an actor', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const context: ScriptContext = {
        command: makeTestCommand(VERB_WAIT, ''),
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      };

      await expect(VerbActorMove.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
      await expect(VerbActorMove.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    });

    it('should target portals by name and move the actor', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const target = makeTestRoom('', '', '', [], []);
      (stateHelper.find as SinonStub).returns(Promise.resolve([target]));

      const actor = makeTestActor('', '', '');
      const room = makeTestRoom('', '', '', [actor], []);
      const portal = makeTestPortal('', 'door', 'west', 'east', 'foo');
      room.portals.push(portal);

      const context: ScriptContext = {
        command: makeTestCommand(VERB_MOVE, portal.meta.name),
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room,
        script,
        state: stateHelper,
        transfer,
      };

      await VerbActorMove.call(actor, context);

      expect(room.actors, 'target actors').to.have.lengthOf(1);
      expect(stateHelper.find).to.have.been.calledWith({
        meta: {
          id: 'foo',
        },
        type: ROOM_TYPE,
      });
      expect(stateHelper.show).to.have.been.calledWith('actor.step.move.portal');
    });

    it('should target portals by source group', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const target = makeTestRoom('', '', '', [], []);
      (stateHelper.find as SinonStub).returns(Promise.resolve([target]));

      const actor = makeTestActor('', '', '');
      const room = makeTestRoom('', '', '', [actor], []);
      const portal = makeTestPortal('', 'door', 'west', 'east', 'foo');
      room.portals.push(portal);
      const context: ScriptContext = {
        command: makeTestCommand(VERB_MOVE, portal.groupSource),
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room,
        script,
        state: stateHelper,
        transfer,
      };

      await VerbActorMove.call(actor, context);

      expect(room.actors, 'target actors').to.have.lengthOf(1);
      expect(stateHelper.find).to.have.been.calledWith({
        meta: {
          id: 'foo',
        },
        type: ROOM_TYPE,
      });
      expect(stateHelper.show).to.have.been.calledWith('actor.step.move.portal');
    });

    it('should target portals by source group and name', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const target = makeTestRoom('', '', '', [], []);
      (stateHelper.find as SinonStub).returns(Promise.resolve([target]));

      const actor = makeTestActor('', '', '');
      const room = makeTestRoom('', '', '', [actor], []);
      const portal = makeTestPortal('', 'door', 'west', 'east', 'foo');
      room.portals.push(portal);
      const context: ScriptContext = {
        command: makeTestCommand(VERB_MOVE, `${portal.groupSource} ${portal.meta.name}`),
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room,
        script,
        state: stateHelper,
        transfer,
      };

      await VerbActorMove.call(actor, context);

      expect(room.actors, 'target actors').to.have.lengthOf(1);
      expect(stateHelper.find).to.have.been.calledWith({
        meta: {
          id: 'foo',
        },
        type: ROOM_TYPE,
      });
      expect(stateHelper.show).to.have.been.calledWith('actor.step.move.portal');
    });

    it('should show a message if the portal cannot be found', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const target = makeTestRoom('', '', '', [], []);
      (stateHelper.find as SinonStub).returns(Promise.resolve([target]));

      const actor = makeTestActor('', '', '');
      const room = makeTestRoom('', '', '', [actor], []);
      const context: ScriptContext = {
        command: makeTestCommand(VERB_MOVE, 'door'),
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room,
        script,
        state: stateHelper,
        transfer,
      };

      await VerbActorMove.call(actor, context);

      expect(stateHelper.show).to.have.been.calledWith('actor.step.move.missing');
    });

    it('should throw an error if the target room cannot be found', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      (stateHelper.find as SinonStub).returns(Promise.resolve([]));

      const actor = makeTestActor('', '', '');
      const room = makeTestRoom('', '', '', [actor], []);
      const portal = makeTestPortal('', 'door', 'west', 'east', 'foo');
      room.portals.push(portal);

      const context: ScriptContext = {
        command: makeTestCommand(VERB_MOVE, `${portal.groupSource} ${portal.meta.name}`),
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room,
        script,
        state: stateHelper,
        transfer,
      };

      return expect(VerbActorMove.call(actor, context)).to.eventually.be.rejectedWith(NotFoundError);
    });

    it('should call the state helper enter method when the moving actor is a player', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const target = makeTestRoom('', '', '', [], []);
      (stateHelper.find as SinonStub).returns(Promise.resolve([target]));

      const actor = makeTestActor('', '', '');
      actor.source = ActorSource.PLAYER;

      const room = makeTestRoom('', '', '', [actor], []);
      const portal = makeTestPortal('', 'door', 'west', 'east', 'foo');
      room.portals.push(portal);

      const context: ScriptContext = {
        command: makeTestCommand(VERB_MOVE, portal.meta.name),
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room,
        script,
        state: stateHelper,
        transfer,
      };
      await VerbActorMove.call(actor, context);

      expect(stateHelper.enter).to.have.callCount(1).and.been.calledWith({
        actor,
        room: target,
      });
    });
  });
});
