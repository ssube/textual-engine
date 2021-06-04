import { expect } from 'chai';
import { Container, NullLogger } from 'noicejs';
import { createStubInstance } from 'sinon';

import { Actor, ACTOR_TYPE, ActorType } from '../../../../src/model/entity/Actor';
import { ITEM_TYPE } from '../../../../src/model/entity/Item';
import { CoreModule } from '../../../../src/module/CoreModule';
import { SignalActorStep } from '../../../../src/script/signal/actor/ActorStep';
import { ActorLookTarget } from '../../../../src/script/verb/ActorLook';
import { MathRandomGenerator } from '../../../../src/service/random/MathRandom';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { STAT_HEALTH, VERB_LOOK, VERB_WAIT } from '../../../../src/util/constants';
import { makeTestState } from '../../../entity';
import { getStubHelper } from '../../../helper';
import { testTransfer } from '../../helper';

const TEST_ACTOR: Actor = {
  actorType: ActorType.DEFAULT,
  items: [{
    meta: {
      desc: 'bon',
      id: 'bon',
      name: 'bon',
      template: 'bon',
    },
    scripts: new Map(),
    stats: new Map(),
    type: ITEM_TYPE,
  }],
  meta: {
    desc: 'bun',
    id: 'bun',
    name: 'bun',
    template: 'bun',
  },
  scripts: new Map([
    [VERB_WAIT, {
      data: new Map(),
      name: 'verb-wait',
    }],
  ]),
  stats: new Map([
    [STAT_HEALTH, 10],
  ]),
  type: ACTOR_TYPE,
};

describe('actor step scripts', () => {
  describe('actor step command', () => {
    it('should invoke the command verb script', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      await SignalActorStep.call(TEST_ACTOR, {
        command: {
          index: 0,
          input: '',
          target: '',
          verb: VERB_WAIT,
        },
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        script,
        state: makeTestState('', []),
        stateHelper,
        transfer,
      });

      expect(script.invoke, 'wait script').to.have.callCount(1).and.been.calledWith(TEST_ACTOR, VERB_WAIT);
      expect(stateHelper.show, 'focus show').to.have.callCount(0);
    });

    it('should not invoke scripts on dead actors', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      await SignalActorStep.call({
        ...TEST_ACTOR,
        actorType: ActorType.PLAYER,
        stats: new Map([
          [STAT_HEALTH, 0],
        ]),
      }, {
        command: {
          index: 0,
          input: '',
          target: '',
          verb: VERB_WAIT,
        },
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        script,
        state: makeTestState('', []),
        stateHelper,
        transfer,
      });

      expect(script.invoke).to.have.callCount(0);
      expect(stateHelper.show).to.have.callCount(1);
    });

    it('should show messages to player actors', async () => {
      const container = Container.from(new CoreModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      await SignalActorStep.call({
        ...TEST_ACTOR,
        actorType: ActorType.PLAYER,
      }, {
        command: {
          index: 0,
          input: '',
          target: '',
          verb: VERB_WAIT,
        },
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        script: createStubInstance(LocalScriptService),
        state: makeTestState('', []),
        stateHelper,
        transfer,
      });

      expect(stateHelper.show).to.have.callCount(1);
    });
  });

  describe('actor step look with target', async () => {
    it('should warn about missing target', async () => {
      const container = Container.from(new CoreModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const stateHelper = getStubHelper();
      const transfer = testTransfer();
      await ActorLookTarget.call({
        ...TEST_ACTOR,
        actorType: ActorType.PLAYER,
      }, {
        command: {
          index: 0,
          input: '',
          target: '',
          verb: VERB_LOOK,
        },
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        script: createStubInstance(LocalScriptService),
        state: makeTestState('', []),
        stateHelper,
        transfer,
      }, '');

      expect(stateHelper.show).to.have.callCount(1);
    });
  });
});
