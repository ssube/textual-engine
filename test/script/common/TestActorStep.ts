import { expect } from 'chai';
import { Container, NullLogger } from 'noicejs';
import { createStubInstance, SinonStub, spy } from 'sinon';

import { Actor, ACTOR_TYPE, ActorType } from '../../../src/model/entity/Actor';
import { ITEM_TYPE } from '../../../src/model/entity/Item';
import { Room } from '../../../src/model/entity/Room';
import { State } from '../../../src/model/State';
import { CoreModule } from '../../../src/module/CoreModule';
import { ActorStep, ActorStepLookTarget } from '../../../src/script/common/ActorStep';
import { MathRandomGenerator } from '../../../src/service/random/MathRandom';
import { LocalScriptService } from '../../../src/service/script/LocalScript';
import { STAT_HEALTH, VERB_LOOK, VERB_WAIT } from '../../../src/util/constants';
import { testFocus, testTransfer } from '../helper';

const TEST_ACTOR: Actor = {
  actorType: ActorType.DEFAULT,
  items: [{
    meta: {
      desc: 'bon',
      id: 'bon',
      name: 'bon',
      template: 'bon',
    },
    slots: new Map(),
    stats: new Map(),
    type: ITEM_TYPE,
    verbs: new Map(),
  }],
  meta: {
    desc: 'bun',
    id: 'bun',
    name: 'bun',
    template: 'bun',
  },
  skills: new Map(),
  slots: new Map(),
  stats: new Map([
    [STAT_HEALTH, 10],
  ]),
  type: ACTOR_TYPE,
};

describe('actor step scripts', () => {
  describe('actor step command', () => {
    it('should invoke the command verb script', async () => {
      const container = Container.from(new CoreModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const focus = testFocus();
      const waitSpy = spy();
      const scripts = new Map([
        [VERB_WAIT, waitSpy],
      ]);
      const transfer = testTransfer();

      await ActorStep.call(TEST_ACTOR, {
        command: {
          index: 0,
          input: '',
          target: '',
          verb: VERB_WAIT,
        },
        data: new Map(),
        focus,
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        script: createStubInstance(LocalScriptService),
        state: {} as State,
        transfer,
      }, scripts);

      expect(waitSpy, 'wait script').to.have.callCount(1);
      expect(focus.show, 'focus show').to.have.callCount(0);
    });

    it('should not invoke scripts on dead actors', async () => {
      const container = Container.from(new CoreModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const focus = testFocus();
      const waitSpy = spy();
      const scripts = new Map([
        [VERB_WAIT, waitSpy],
      ]);
      const transfer = testTransfer();

      await ActorStep.call({
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
        focus,
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        script: createStubInstance(LocalScriptService),
        state: {} as State,
        transfer,
      }, scripts);

      expect(waitSpy).to.have.callCount(0);
      expect(focus.show).to.have.callCount(1);
    });

    it('should show messages to player actors', async () => {
      const container = Container.from(new CoreModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const focus = testFocus();
      (focus.show as SinonStub).returns(Promise.resolve());
      const transfer = testTransfer();

      await ActorStep.call({
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
        focus,
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        script: createStubInstance(LocalScriptService),
        state: {} as State,
        transfer,
      });

      expect(focus.show).to.have.callCount(1);
    });
  });

  describe('actor step look with target', async () => {
    it('should warn about missing target', async () => {
      const container = Container.from(new CoreModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const focus = testFocus();
      (focus.show as SinonStub).returns(Promise.resolve());
      const transfer = testTransfer();

      await ActorStepLookTarget.call({
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
        focus,
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        script: createStubInstance(LocalScriptService),
        state: {
          rooms: [] as Array<Room>,
        } as State,
        transfer,
      }, '');

      expect(focus.show).to.have.callCount(1);
    });
  });
});
