import { expect } from 'chai';
import { NullLogger } from 'noicejs';
import { createStubInstance, match, SinonStub } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { Actor, ACTOR_TYPE, ActorType } from '../../../../src/model/entity/Actor';
import { VerbActorDrop } from '../../../../src/script/verb/ActorDrop';
import { MathRandomGenerator } from '../../../../src/service/random/MathRandom';
import { ScriptContext } from '../../../../src/service/script';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { VERB_DROP, VERB_WAIT } from '../../../../src/util/constants';
import { makeTestItem, makeTestRoom } from '../../../entity';
import { getStubHelper } from '../../../helper';
import { testTransfer } from '../../helper';

describe('actor drop scripts', () => {
  describe('actor drop command', () => {
    it('should require the target be an actor', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const context: ScriptContext = {
        command: {
          index: 0,
          input: '',
          target: '',
          verb: VERB_WAIT,
        },
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      };

      await expect(VerbActorDrop.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
      await expect(VerbActorDrop.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    });

    it('should find the target by id', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const items = [
        makeTestItem('foo-1', '', ''),
        makeTestItem('foo-2', '', ''),
        makeTestItem('bar-1', '', ''),
      ];
      (stateHelper.find as SinonStub).returns(Promise.resolve(items));

      const actor: Actor = {
        actorType: ActorType.DEFAULT,
        items: [items[0]],
        meta: {
          id: '',
          name: '',
          desc: '',
          template: '',
        },
        scripts: new Map(),
        stats: new Map(),
        type: ACTOR_TYPE,
      };
      const context: ScriptContext = {
        command: {
          index: 0,
          input: '',
          target: 'foo',
          verb: VERB_DROP,
        },
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      };
      await VerbActorDrop.call(actor, context);
      expect(transfer.moveItem).to.have.been.calledWithMatch({
        moving: items[0],
        source: match.object,
        target: match.object,
      });
    });

    it('should find the target by name', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const items = [
        makeTestItem('foo-1', 'foo bob', ''),
        makeTestItem('foo-2', 'foo bin', ''),
        makeTestItem('bar-1', 'bar bin', ''),
      ];
      (stateHelper.find as SinonStub).returns(Promise.resolve(items));

      const actor: Actor = {
        actorType: ActorType.DEFAULT,
        items: [items[0]],
        meta: {
          id: '',
          name: '',
          desc: '',
          template: '',
        },
        scripts: new Map(),
        stats: new Map(),
        type: ACTOR_TYPE,
      };
      const context: ScriptContext = {
        command: {
          index: 0,
          input: '',
          target: 'bob',
          verb: VERB_DROP,
        },
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      };
      await VerbActorDrop.call(actor, context);
      expect(transfer.moveItem).to.have.been.calledWithMatch({
        moving: items[0],
        source: match.object,
        target: match.object,
      });
    });

    it('should use the command index', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      const items = [
        makeTestItem('foo-1', 'foo bob', ''),
        makeTestItem('foo-2', 'foo bin', ''),
        makeTestItem('bar-1', 'bar bin', ''),
      ];
      (stateHelper.find as SinonStub).returns(Promise.resolve(items));

      const actor: Actor = {
        actorType: ActorType.DEFAULT,
        items: [items[0]],
        meta: {
          id: '',
          name: '',
          desc: '',
          template: '',
        },
        scripts: new Map(),
        stats: new Map(),
        type: ACTOR_TYPE,
      };
      const context: ScriptContext = {
        command: {
          index: 1,
          input: '',
          target: 'foo',
          verb: VERB_DROP,
        },
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      };
      await VerbActorDrop.call(actor, context);
      expect(transfer.moveItem).to.have.been.calledWithMatch({
        moving: items[1],
        source: match.object,
        target: match.object,
      });
    });

    it('should show an error if the target was not found', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      (stateHelper.find as SinonStub).returns(Promise.resolve([]));

      const actor: Actor = {
        actorType: ActorType.DEFAULT,
        items: [],
        meta: {
          id: '',
          name: '',
          desc: '',
          template: '',
        },
        scripts: new Map(),
        stats: new Map(),
        type: ACTOR_TYPE,
      };
      const context: ScriptContext = {
        command: {
          index: 1,
          input: '',
          target: 'foo',
          verb: VERB_DROP,
        },
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      };

      await VerbActorDrop.call(actor, context);
      expect(transfer.moveItem).to.have.callCount(0);
      expect(stateHelper.show).to.have.callCount(1);
    });
  });
});