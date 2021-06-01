import { Actor, ACTOR_TYPE, ActorType } from '../src/model/entity/Actor';
import { Item, ITEM_TYPE } from '../src/model/entity/Item';
import { Room, ROOM_TYPE } from '../src/model/entity/Room';
import { WorldState } from '../src/model/world/State';

export function makeTestActor(id: string, name: string, template: string, ...items: Array<Item>): Actor {
  return {
    actorType: ActorType.DEFAULT,
    items,
    meta: {
      desc: '',
      id,
      name,
      template,
    },
    skills: new Map(),
    slots: new Map(),
    stats: new Map(),
    type: ACTOR_TYPE,
  };
}

export function makeTestItem(id: string, name: string, template: string): Item {
  return {
    meta: {
      desc: '',
      id,
      name,
      template,
    },
    slots: new Map(),
    stats: new Map(),
    type: ITEM_TYPE,
    verbs: new Map(),
  };
}

export function makeTestRoom(id: string, name: string, template: string, actors: Array<Actor>, items: Array<Item>): Room {
  return {
    actors,
    items,
    meta: {
      desc: '',
      id,
      name,
      template,
    },
    portals: [],
    slots: new Map(),
    type: ROOM_TYPE,
    verbs: new Map(),
  };
}

export function makeTestState(id: string, rooms: Array<Room>): WorldState {
  return {
    meta: {
      desc: '',
      id,
      name: id,
      template: '',
    },
    rooms,
    start: {
      room: '',
    },
    step: {
      time: 0,
      turn: 0,
    },
    world: {
      depth: 0,
      id: '',
      seed: '',
    },
  };
}
