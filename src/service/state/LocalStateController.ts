import { isNil, mustExist, NotFoundError } from '@apextoaster/js-utils';

import { CreateParams, StateController } from '.';
import { Actor, ActorType } from '../../models/entity/Actor';
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
import { ActorInputMapper } from '../input/ActorInputMapper';
import { ScriptController } from '../script';
import { LocalScriptController } from '../script/LocalScriptController';

export class LocalStateController implements StateController {
  protected counter: Counter;
  protected input: ActorInputMapper;
  protected random: Random;
  protected script: ScriptController;

  protected state?: State;
  protected world?: World;

  constructor(input: ActorInputMapper) {
    this.counter = new LocalCounter();
    this.input = input;
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
      input: new Map(),
      rooms: [],
    };

    // save state for later
    this.state = state;
    this.world = world;

    // pick a starting room and create it
    const startRoomId = world.start.rooms[this.random.nextInt(world.start.rooms.length)];
    console.log(world.templates.rooms, startRoomId);
    const startRoomTemplate = world.templates.rooms.find((it) => it.base.meta.id.base === startRoomId);
    if (isNil(startRoomTemplate)) {
      throw new NotFoundError('invalid start room');
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
      if (isNil(nextRoomTemplate)) {
        throw new NotFoundError('invalid next room');
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
    if (isNil(startActorTemplate)) {
      throw new NotFoundError('invalid start actor');
    }
    const startActor = this.createActor(startActorTemplate);
    startActor.kind = ActorType.PLAYER;

    // add to state and the start room
    state.focus.actor = startActor.meta.id;
    startRoom.actors.push(startActor);
    this.input.add(startActor);
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
    if (isNil(this.state)) {
      throw new Error('state has not been initialized');
    }

    const input = await this.input.history();
    return {
      ...this.state,
      input,
    };
  }

  /**
   * Step the internal world state, simulating some turns and time passing.
   */
  async step(time: number) {
    if (isNil(this.state)) {
      throw new Error('state has not been initialized');
    }

    const scope = {
      data: {
        time,
      },
      script: this.script,
      state: this.state,
    };

    for (const room of this.state.rooms) {
      await this.script.invoke(room, 'step', {
        ...scope,
        room,
      });

      for (const actor of room.actors) {
        const input = await this.input.get(actor);
        const [command] = await input.last();

        await this.script.invoke(actor, 'step', {
          ...scope,
          actor,
          command,
          room,
        });

        for (const item of actor.items) {
          await this.script.invoke(item, 'step', {
            ...scope,
            actor,
            item,
            room,
          });
        }
      }

      for (const item of room.items) {
        await this.script.invoke(item, 'step', {
          ...scope,
          item,
          room,
        });
      }
    }
  }

  protected createActor(template: Template<Actor>): Actor {
    const actor: Actor = {
      type: 'actor',
      kind: ActorType.DEFAULT,
      items: [],
      meta: {
        desc: template.base.meta.desc.base,
        id: `${template.base.meta.id.base}-${this.counter.next('actor')}`,
        name: template.base.meta.name.base,
      },
      skills: new Map(),
      slots: new Map(template.base.slots),
      stats: new Map(template.base.stats),
    };

    for (const itemTemplateId of template.base.items) {
      const itemTemplate = this.world!.templates.items.find((it) => it.base.meta.id.base === itemTemplateId.id);
      if (isNil(itemTemplate)) {
        throw new NotFoundError('invalid item in actor');
      }

      actor.items.push(this.createItem(itemTemplate));
    }

    return actor;
  }

  protected createItem(template: Template<Item>): Item {
    return {
      type: 'item',
      meta: {
        desc: template.base.meta.desc.base,
        id: `${template.base.meta.id.base}-${this.counter.next('item')}`,
        name: template.base.meta.name.base,
      },
      stats: new Map(),
      slots: new Map(template.base.slots),
    };
  }

  protected createRoom(template: Template<Room>): Room {
    const world = mustExist(this.world);
    const actors = [];

    for (const actorTemplateId of template.base.actors) {
      const actorTemplate = world.templates.actors.find((it) => {
        console.log('actor find', actorTemplateId, it.base.meta);
        return it.base.meta.id.base === actorTemplateId.id;
      });
      console.log('create actor for room', actorTemplateId, actorTemplate, world.templates.actors);

      if (isNil(actorTemplate)) {
        throw new NotFoundError('invalid actor in room');
      }

      const actor = this.createActor(actorTemplate);

      this.input.add(actor);
      actors.push(actor);
    }

    return {
      type: 'room',
      actors,
      items: [],
      meta: {
        desc: template.base.meta.desc.base,
        id: `${template.base.meta.id.base}-${this.counter.next('room')}`,
        name: template.base.meta.name.base,
      },
      portals: [],
      slots: new Map(template.base.slots),
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