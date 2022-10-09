import { Actor, ACTOR_TYPE, ActorSource } from '../src/model/entity/Actor.js';
import { Item, ITEM_TYPE } from '../src/model/entity/Item.js';
import { Portal, PORTAL_TYPE, PortalLinkage } from '../src/model/entity/Portal.js';
import { Room, ROOM_TYPE } from '../src/model/entity/Room.js';
import { Template } from '../src/model/mapped/Template.js';
import { Metadata } from '../src/model/Metadata.js';
import { WorldState } from '../src/model/world/State.js';
import { WorldTemplate } from '../src/model/world/Template.js';
import { TEMPLATE_CHANCE } from '../src/util/constants.js';
import { zeroStep } from '../src/util/entity/index.js';

export function makeTestActor(id: string, name: string, template: string, ...items: Array<Item>): Actor {
  return {
    flags: new Map(),
    items,
    meta: {
      desc: '',
      id,
      name,
      template,
    },
    scripts: new Map(),
    slots: new Map(),
    source: ActorSource.BEHAVIOR,
    stats: new Map(),
    type: ACTOR_TYPE,
  };
}

export function makeTestItem(id: string, name: string, template: string): Item {
  return {
    flags: new Map(),
    meta: {
      desc: '',
      id,
      name,
      template,
    },
    scripts: new Map(),
    slot: '',
    stats: new Map(),
    type: ITEM_TYPE,
  };
}

export function makeTestRoom(
  id: string,
  name: string,
  template: string,
  actors: Array<Actor> = [],
  items: Array<Item> = [],
  portals: Array<Portal> = []
): Room {
  return {
    actors,
    flags: new Map(),
    items,
    meta: {
      desc: '',
      id,
      name,
      template,
    },
    portals,
    scripts: new Map(),
    type: ROOM_TYPE,
  };
}

export function makeTestPortal(id: string, name: string, source: string, target: string, dest: string): Portal {
  return {
    dest,
    flags: new Map(),
    group: {
      key: name,
      source: source,
      target: target,
    },
    link: PortalLinkage.BOTH,
    meta: {
      desc: '',
      id,
      name,
      template: '',
    },
    scripts: new Map(),
    stats: new Map(),
    type: PORTAL_TYPE,
  };
}

export function makeTestMeta(id: string, name: string = '', template: string = ''): Metadata {
  return {
    desc: '',
    id,
    name,
    template,
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
    step: zeroStep(),
    world: {
      depth: 0,
      id: '',
      seed: '',
    },
  };
}

export function makeTestWorld(actors: Array<Template<Actor>>, items: Array<Template<Item>>, portals: Array<Template<Portal>>, rooms: Array<Template<Room>>): WorldTemplate {
  const [defaultActor] = actors;
  const [defaultItem] = items;
  const [defaultPortal] = portals;
  const [defaultRoom] = rooms;

  return {
    defaults: {
      actor: defaultActor.base,
      item: defaultItem.base,
      portal: defaultPortal.base,
      room: defaultRoom.base,
    },
    locale: {
      languages: {},
    },
    meta: {
      id: 'foo',
      name: { base: 'foo', type: 'string' },
      desc: { base: 'foo', type: 'string' },
    },
    start: {
      actors: [{
        chance: TEMPLATE_CHANCE,
        id: defaultActor.base.meta.id,
        type: 'id',
      }],
      rooms: [{
        chance: TEMPLATE_CHANCE,
        id: defaultRoom.base.meta.id,
        type: 'id',
      }],
    },
    templates: {
      actors,
      items,
      portals,
      rooms,
    },
  };
}
