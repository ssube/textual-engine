import { expect } from 'chai';
import { Container, NullLogger } from 'noicejs';
import { createStubInstance, match } from 'sinon';

import { ScriptTargetError } from '../../../../src/error/ScriptTargetError';
import { makeCommand } from '../../../../src/model/Command';
import { Actor, ACTOR_TYPE, ActorSource } from '../../../../src/model/entity/Actor';
import { ITEM_TYPE } from '../../../../src/model/entity/Item';
import { CoreModule } from '../../../../src/module/CoreModule';
import { SignalActorStep } from '../../../../src/script/signal/actor/ActorStep';
import { MathRandomService } from '../../../../src/service/random/MathRandom';
import { LocalScriptService } from '../../../../src/service/script/LocalScript';
import { STAT_HEALTH, VERB_MOVE, VERB_WAIT } from '../../../../src/util/constants';
import { makeTestItem, makeTestRoom } from '../../../entity';
import { createTestContext, createTestTransfer, getStubHelper } from '../../../helper';

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
      const state = getStubHelper();
      const context = createTestContext({
        command: makeCommand(VERB_WAIT),
        random: createStubInstance(MathRandomService),
        room: makeTestRoom('', '', '', [], []),
        state,
      });

      await expect(SignalActorStep.call(makeTestItem('', '', ''), context)).to.eventually.be.rejectedWith(ScriptTargetError);
      await expect(SignalActorStep.call(makeTestRoom('', '', '', [], []), context)).to.eventually.be.rejectedWith(ScriptTargetError);
    });

    it('should invoke the command verb script', async () => {
      const script = createStubInstance(LocalScriptService);
      const state = getStubHelper();

      const context = createTestContext({
        command: makeCommand(VERB_WAIT),
        random: createStubInstance(MathRandomService),
        room: makeTestRoom('', '', '', [], []),
        script,
        state,
      });

      await SignalActorStep.call(TEST_ACTOR, context);

      expect(script.invoke, 'wait script').to.have.callCount(1).and.been.calledWith(TEST_ACTOR, VERB_WAIT);
      expect(state.show, 'focus show').to.have.callCount(0);
    });

    it('should not invoke scripts on dead actors', async () => {
      const script = createStubInstance(LocalScriptService);
      const state = getStubHelper();
      const transfer = createTestTransfer();

      const context = createTestContext({
        command: makeCommand(VERB_WAIT),
        random: createStubInstance(MathRandomService),
        script,
        state,
        transfer,
      });

      await SignalActorStep.call({
        ...TEST_ACTOR,
        source: ActorSource.PLAYER,
        stats: new Map([
          [STAT_HEALTH, 0],
        ]),
      }, context);

      expect(script.invoke).to.have.callCount(0);
      expect(state.show).to.have.callCount(1);
    });

    it('should show messages to player actors', async () => {
      const container = Container.from(new CoreModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const stateHelper = getStubHelper();
      const transfer = createTestTransfer();

      const room = makeTestRoom('', '', '', [], []);
      const player = {
        ...TEST_ACTOR,
        source: ActorSource.PLAYER,
      };
      const context = createTestContext({
        actor: player,
        command: makeCommand(VERB_WAIT),
        random: createStubInstance(MathRandomService),
        room,
        state: stateHelper,
        transfer,
      });
      await SignalActorStep.call(player, context);

      expect(stateHelper.show).to.have.callCount(1).and.have.been.calledWithMatch(match.object, 'actor.step.command.player.verb');
    });

    it('should not invoke any scripts without a command', async () => {
      const container = Container.from(new CoreModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const script = createStubInstance(LocalScriptService);
      const state = getStubHelper();
      const transfer = createTestTransfer();

      const room = makeTestRoom('', '', '', [], []);
      const player = {
        ...TEST_ACTOR,
        source: ActorSource.PLAYER,
      };
      const context = createTestContext({
        actor: player,
        random: createStubInstance(MathRandomService),
        room,
        script,
        state,
        transfer,
      });

      await SignalActorStep.call(player, context);

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
      const transfer = createTestTransfer();

      const room = makeTestRoom('', '', '', [], []);
      const player = {
        ...TEST_ACTOR,
        source: ActorSource.PLAYER,
      };
      const context = createTestContext({
        actor: player,
        command: makeCommand(VERB_MOVE), // must be a verb that does not exist
        random: createStubInstance(MathRandomService),
        room,
        script,
        state,
        transfer,
      });
      await SignalActorStep.call(player, context);

      expect(script.invoke).to.have.callCount(0);
      expect(state.show).to.have.callCount(1).and.have.been.calledWithMatch(match.object, 'actor.step.command.unknown');
    });
  });
});
