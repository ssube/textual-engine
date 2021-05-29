import { expect } from 'chai';

import { ACTOR_TYPE, ActorType } from '../../../src/model/entity/Actor';
import { ITEM_TYPE } from '../../../src/model/entity/Item';
import { ROOM_TYPE } from '../../../src/model/entity/Room';
import { State } from '../../../src/model/State';
import { findContainer, findRoom, searchState } from '../../../src/util/state';

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

describe('state transfer utils', () => {
  describe('move actor helper', () => {
    xit('should move actors from one room to another');
    xit('should only move actors');
    xit('should only target rooms');
    xit('should only move actors that are within the source room');
    xit('should invoke the enter script on the destination room');

    // should this one exist or is that too internal?
    xit('should not modify the moving object when the source and target are the same');
  });

  describe('move item helper', () => {
    xit('should move items from one entity to another');
    xit('should only move items');
    xit('should target both actors and rooms');
    xit('should only move items that are within the source entity');
    xit('should invoke the get script on the destination entity');
  });
});
