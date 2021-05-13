import { CreateParams, StateController } from '.';
import { Actor } from '../../models/entity/Actor';
import { Item } from '../../models/entity/Item';
import { PortalGroups } from '../../models/entity/Portal';
import { Room } from '../../models/entity/Room';
import { Template } from '../../models/meta/Template';
import { ReactionConfig, SidebarConfig, State } from '../../models/State';
import { World } from '../../models/World';
import { Counter } from '../../utils/counter';
import { LocalCounter } from '../../utils/counter/LocalCounter';
import { Random } from '../../utils/random';
import { MathRandom } from '../../utils/random/MathRandom';
import { ScriptController } from '../script';
import { LocalScriptController } from '../script/LocalScriptController';

export class LocalStateController implements StateController {
  protected counter: Counter;
  protected random: Random;
  protected script: ScriptController;

  protected state?: State;
  protected world?: World;

  constructor() {
    this.counter = new LocalCounter();
    this.random = new MathRandom();
    this.script = new LocalScriptController();
  }

  /**
   * Create a new world state from a world template.
   */
  async from(world: World, params: CreateParams) {
    const state: State = {
      config: {
        reaction: ReactionConfig.REACTION_STAT,
        sidebar: SidebarConfig.NEVER_OPEN,
        seed: params.seed,
        world: world.meta.name,
      },
      focus: {
        actor: '',
        room: '',
      },
      input: [],
      rooms: [],
    };

    // pick a starting room and create it
    const startRoomId = world.start.rooms[this.random.nextInt(world.start.rooms.length)];
    console.log(world.templates.rooms, startRoomId);
    const startRoomTemplate = world.templates.rooms.find((it) => it.base.meta.id.base === startRoomId);
    if (startRoomTemplate === null || startRoomTemplate === undefined) {
      throw new Error('invalid start room');
    }
    const startRoom = this.createRoom(startRoomTemplate);

    // add to state
    state.focus.room = startRoom.meta.id;
    state.rooms.push(startRoom);

    // generate more rooms based on start room's doors
    const portalGroups = this.gatherPortals(startRoomTemplate);
    for (const [group, portal] of portalGroups) {
      const nextRoomId = Array.from(portal.dests)[this.random.nextInt(portal.dests.size)];
      console.log('next room', nextRoomId, world.templates.rooms);

      const nextRoomTemplate = world.templates.rooms.find((it) => it.base.meta.id.base === nextRoomId);
      if (nextRoomTemplate === null || nextRoomTemplate === undefined) {
        throw new Error('invalid next room');
      }

      const nextRoom = this.createRoom(nextRoomTemplate);
      state.rooms.push(nextRoom);

      for (const portalName of portal.sources) {
        startRoom.portals.push({
          dest: nextRoom.meta.id,
          group,
          name: portalName,
        });
      }
    }

    // pick a starting actor and create it
    const startActorId = world.start.actors[this.random.nextInt(world.start.actors.length)];
    const startActorTemplate = world.templates.actors.find((it) => it.base.meta.id.base === startActorId);
    if (startActorTemplate === null || startActorTemplate === undefined) {
      throw new Error('invalid start actor');
    }
    const startActor = this.createActor(startActorTemplate);

    // add to state and the start room
    state.focus.actor = startActor.meta.id;
    startRoom.actors.push(startActor);

    this.state = state;
    this.world = world;
  }

  /**
   * Load an existing world state.
   */
  async load(state: State) {
    this.state = state;
  }

  async next() {
    return true;
  }

  /**
   * Save the current world state.
   */
  async save(): Promise<State> {
    if (this.state === null || this.state === undefined) {
      throw new Error('state has not been initialized');
    }
    return this.state;
  }

  /**
   * Step the internal world state, simulating some turns and time passing.
   */
  async step(time: number) {
    if (this.state === null || this.state === undefined) {
      throw new Error('state has not been initialized');
    }

    for (const room of this.state.rooms) {
      for (const actor of room.actors) {
        this.script.invoke(actor, 'step', {
          actor,
          room,
          time,
        });

        for (const item of actor.items) {
          this.script.invoke(item, 'step', {
            actor,
            item,
            room,
            time,
          });
        }
      }

      for (const item of room.items) {
        this.script.invoke(item, 'step', {
          item,
          room,
          time,
        });
      }
    }
  }

  protected createActor(template: Template<Actor>): Actor {
    const actor: Actor = {
      items: [],
      meta: {
        desc: template.base.meta.desc.base,
        id: `${template.base.meta.id.base}-${this.counter.next('actor')}`,
        name: template.base.meta.name.base,
      },
      skills: new Map(),
      slots: new Map(),
      stats: new Map(),
    };

    for (const itemTemplate of template.base.items) {
      actor.items.push(this.createItem(itemTemplate));
    }

    return actor;
  }

  protected createItem(template: Template<Item>): Item {
    return {
      meta: {
        desc: template.base.meta.desc.base,
        id: `${template.base.meta.id.base}-${this.counter.next('item')}`,
        name: template.base.meta.name.base,
      },
      stats: new Map(),
      slots: new Map(),
    };
  }

  protected createRoom(template: Template<Room>): Room {
    return {
      actors: [],
      items: [],
      meta: {
        desc: template.base.meta.desc.base,
        id: `${template.base.meta.id.base}-${this.counter.next('room')}`,
        name: template.base.meta.name.base,
      },
      portals: [],
      slots: new Map(),
    };
  }

  /**
   * Gather portal destinations from a room by group.
   */
  protected gatherPortals(template: Template<Room>): PortalGroups {
    const groups: PortalGroups = new Map();

    for (const portal of template.base.portals) {
      console.log('portal group', portal);
      const groupName = portal.base.group.base;
      const group = groups.get(groupName);

      if (group) {
        group.dests.add(portal.base.dest.base);
        group.sources.add(portal.base.name.base);
      } else {
        groups.set(groupName, {
          dests: new Set([portal.base.dest.base]),
          sources: new Set([portal.base.name.base]),
        });
      }
    }

    return groups;
  }
}