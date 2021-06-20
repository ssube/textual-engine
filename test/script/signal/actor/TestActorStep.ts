import { expect } from 'chai';
import { Container, NullLogger } from 'noicejs';
import { createStubInstance } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { Actor, ACTOR_TYPE, ActorSource } from '../../../../src/model/entity/Actor';
import { ITEM_TYPE } from '../../../../src/model/entity/Item';
import { CoreModule } from '../../../../src/module/CoreModule';
import { SignalActorStep } from '../../../../src/script/signal/actor/ActorStep';
import { MathRandomGenerator } from '../../../../src/service/random/MathRandom';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { STAT_HEALTH, VERB_MOVE, VERB_WAIT } from '../../../../src/util/constants';
import { makeTestItem, makeTestRoom } from '../../../entity';
import { getStubHelper } from '../../../helper';
import { testTransfer } from '../../helper';

const TEST_ACTOR: Actor = {
  items: [{
    meta: {
      desc: 'bon',
      id: 'bon',
      name: 'bon',
      template: 'bon',
    },
    scripts: new Map(),
    slot: '',
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
  slots: new Map(),
  source: ActorSource.BEHAVIOR,
  stats: new Map([
    [STAT_HEALTH, 10],
  ]),
  type: ACTOR_TYPE,
};

describe('actor step scripts', () => {
  describe('actor step command', () => {
    it('should require the script target be an actor', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();
      const context = {
        command: makeCommand(VERB_WAIT),
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
        transfer,
      };

      await expect(SignalActorStep.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
      await expect(SignalActorStep.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    });

    it('should invoke the command verb script', async () => {
      const script = createStubInstance(LocalScriptService);
      const stateHelper = getStubHelper();
      const transfer = testTransfer();

      await SignalActorStep.call(TEST_ACTOR, {
        command: makeCommand(VERB_WAIT),
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room: makeTestRoom('', '', '', [], []),
        script,
        state: stateHelper,
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
        source: ActorSource.PLAYER,
        stats: new Map([
          [STAT_HEALTH, 0],
        ]),
      }, {
        command: makeCommand(VERB_WAIT),
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        script,
        state: stateHelper,
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

      const room = makeTestRoom('', '', '', [], []);
      const player = {
        ...TEST_ACTOR,
        source: ActorSource.PLAYER,
      };
      await SignalActorStep.call(player, {
        actor: player,
        command: makeCommand(VERB_WAIT),
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room,
        script: createStubInstance(LocalScriptService),
        state: stateHelper,
        transfer,
      });

      expect(stateHelper.show).to.have.callCount(1).and.have.been.calledWith('actor.step.command.player.verb');
    });

    it('should not invoke any scripts without a command', async () => {
      const container = Container.from(new CoreModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const script = createStubInstance(LocalScriptService);
      const state = getStubHelper();
      const transfer = testTransfer();

      const room = makeTestRoom('', '', '', [], []);
      const player = {
        ...TEST_ACTOR,
        source: ActorSource.PLAYER,
      };
      await SignalActorStep.call(player, {
        actor: player,
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room,
        script,
        state,
        transfer,
      });

      expect(script.invoke).to.have.callCount(0);
      expect(state.show).to.have.callCount(0);
    });

    it('should show a message when the command verb has no script', async () => {
      const container = Container.from(new CoreModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const script = createStubInstance(LocalScriptService);
      const state = getStubHelper();
      const transfer = testTransfer();

      const room = makeTestRoom('', '', '', [], []);
      const player = {
        ...TEST_ACTOR,
        source: ActorSource.PLAYER,
      };
      await SignalActorStep.call(player, {
        actor: player,
        command: makeCommand(VERB_MOVE), // must be a verb that does not exist
        data: new Map(),
        logger: NullLogger.global,
        random: createStubInstance(MathRandomGenerator),
        room,
        script,
        state,
        transfer,
      });

      expect(script.invoke).to.have.callCount(0);
      expect(state.show).to.have.callCount(1).and.have.been.calledWith('actor.step.command.unknown');
    });
  });
});
