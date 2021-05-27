import { InvalidArgumentError } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { Container, NullLogger } from 'noicejs';
import { spy } from 'sinon';

import { ACTOR_TYPE, ActorType } from '../../../src/model/entity/Actor';
import { ITEM_TYPE } from '../../../src/model/entity/Item';
import { ROOM_TYPE } from '../../../src/model/entity/Room';
import { State } from '../../../src/model/State';
import { LocalModule } from '../../../src/module/LocalModule';
import { ShowMessageVolume, StateFocusResolver } from '../../../src/util/state/FocusResolver';

const TEST_STATE: State = {
  focus: {
    actor: '',
    room: '',
  },
  meta: {
    desc: '',
    id: '',
    name: '',
    template: '',
  },
  rooms: [{
    actors: [{
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
      stats: new Map(),
      type: ACTOR_TYPE,
    }],
    items: [],
    meta: {
      desc: 'foo',
      id: 'foo',
      name: 'foo',
      template: 'foo',
    },
    portals: [],
    slots: new Map(),
    type: ROOM_TYPE,
    verbs: new Map(),
  }, {
    actors: [],
    items: [{
      meta: {
        desc: 'bin',
        id: 'bin',
        name: 'bin',
        template: 'bin',
      },
      slots: new Map(),
      stats: new Map(),
      type: ITEM_TYPE,
      verbs: new Map(),
    }],
    meta: {
      desc: 'bar',
      id: 'bar',
      name: 'bar',
      template: 'bar',
    },
    portals: [],
    slots: new Map(),
    type: ROOM_TYPE,
    verbs: new Map(),
  }],
  start: {
    actor: '',
    room: '',
  },
  step: {
    time: 0,
    turn: 0,
  },
  world: {
    depth: 0,
    seed: '',
  },
};

describe('state focus utils', () => {
  describe('focus actor helper', () => {
    it('should set the focus actor', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const actorSpy = spy();
      const state = {
        ...TEST_STATE,
        focus: {
          ...TEST_STATE.focus,
        },
      };
      const focus = await container.create(StateFocusResolver, {
        events: {
          onActor: actorSpy,
          onRoom: spy(),
          onShow: spy(),
        },
        state,
      });

      await focus.setActor('bun');

      expect(state.focus.actor).to.equal('bun');
      expect(actorSpy).to.have.callCount(1);
    });

    it('should throw when the actor is missing', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const actorSpy = spy();
      const focus = await container.create(StateFocusResolver, {
        events: {
          onActor: actorSpy,
          onRoom: spy(),
          onShow: spy(),
        },
        state: TEST_STATE,
      });

      await expect(focus.setActor('none')).to.eventually.be.rejectedWith(InvalidArgumentError);
      expect(actorSpy).to.have.callCount(0);
    });
  });

  describe('focus room helper', () => {
    it('should set the focus room', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const roomSpy = spy();
      const state = {
        ...TEST_STATE,
        focus: {
          ...TEST_STATE.focus,
        },
      };
      const focus = await container.create(StateFocusResolver, {
        events: {
          onActor: spy(),
          onRoom: roomSpy,
          onShow: spy(),
        },
        state,
      });

      await focus.setRoom('foo');

      expect(state.focus.room).to.equal('foo');
      expect(roomSpy).to.have.callCount(1);
    });

    it('should throw when the room is missing', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const roomSpy = spy();
      const focus = await container.create(StateFocusResolver, {
        events: {
          onActor: spy(),
          onRoom: roomSpy,
          onShow: spy(),
        },
        state: TEST_STATE,
      });

      await expect(focus.setRoom('none')).to.eventually.be.rejectedWith(InvalidArgumentError);
      expect(roomSpy).to.have.callCount(0);
    });
  });

  describe('show message helper', () => {
    it('should forward the message with context', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const showSpy = spy();
      const focus = await container.create(StateFocusResolver, {
        events: {
          onActor: spy(),
          onRoom: spy(),
          onShow: showSpy,
        },
        state: {
          ...TEST_STATE,
          focus: {
            ...TEST_STATE.focus,
          },
        },
      });

      await focus.show('foo', {});

      expect(showSpy).to.have.callCount(1);
    });

    it('should always show messages to the current world', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const showSpy = spy();
      const focus = await container.create(StateFocusResolver, {
        events: {
          onActor: spy(),
          onRoom: spy(),
          onShow: showSpy,
        },
        state: {
          ...TEST_STATE,
          focus: {
            ...TEST_STATE.focus,
          },
        },
      });

      await focus.show('foo', {}, {
        source: TEST_STATE.rooms[0].actors[0],
        volume: ShowMessageVolume.WORLD,
      });

      expect(showSpy).to.have.callCount(1);
    });

    it('should show room messages from the current room', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const showSpy = spy();
      const focus = await container.create(StateFocusResolver, {
        events: {
          onActor: spy(),
          onRoom: spy(),
          onShow: showSpy,
        },
        state: {
          ...TEST_STATE,
          focus: {
            actor: 'foo',
            room: TEST_STATE.rooms[1].meta.id,
          },
        },
      });

      await focus.show('foo', {}, {
        source: TEST_STATE.rooms[0].actors[0],
        volume: ShowMessageVolume.ROOM,
      });

      expect(showSpy).to.have.callCount(0);
    });

    it('should filter room messages from other rooms', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const showSpy = spy();
      const focus = await container.create(StateFocusResolver, {
        events: {
          onActor: spy(),
          onRoom: spy(),
          onShow: showSpy,
        },
        state: {
          ...TEST_STATE,
          focus: {
            actor: 'foo',
            room: TEST_STATE.rooms[1].meta.id,
          },
        },
      });

      await focus.show('foo', {}, {
        source: TEST_STATE.rooms[1],
        volume: ShowMessageVolume.ROOM,
      });

      expect(showSpy).to.have.callCount(1);
    });

    it('should show self messages from the current actor', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const showSpy = spy();
      const focus = await container.create(StateFocusResolver, {
        events: {
          onActor: spy(),
          onRoom: spy(),
          onShow: showSpy,
        },
        state: {
          ...TEST_STATE,
          focus: {
            actor: TEST_STATE.rooms[0].actors[0].meta.id,
            room: 'foo',
          },
        },
      });

      await focus.show('foo', {}, {
        source: TEST_STATE.rooms[0].actors[0],
        volume: ShowMessageVolume.SELF,
      });

      expect(showSpy).to.have.callCount(1);
    });

    xit('should filter self messages from other actors');
  });
});
