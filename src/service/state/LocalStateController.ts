import { doesExist, isNil, mustCoalesce, mustExist, NotFoundError } from '@apextoaster/js-utils';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { CreateParams, StateController } from '.';
import { Actor, ActorType } from '../../model/entity/Actor';
import { Item } from '../../model/entity/Item';
import { Portal, PortalGroups } from '../../model/entity/Portal';
import { Room } from '../../model/entity/Room';
import { BaseTemplate, Template } from '../../model/meta/Template';
import { ReactionConfig, SidebarConfig, State } from '../../model/State';
import { World } from '../../model/World';
import { INJECT_COUNTER, INJECT_INPUT_MAPPER, INJECT_LOGGER, INJECT_RANDOM, INJECT_SCRIPT } from '../../module';
import { PORTAL_DEPTH } from '../../util/constants';
import { Counter } from '../../util/counter';
import { findByBaseId, renderNumberMap, renderString, renderStringMap, renderVerbMap } from '../../util/template';
import { ActorInputMapper } from '../input/ActorInputMapper';
import { RandomGenerator } from '../random';
import { ScriptController, SuppliedScope } from '../script';

export interface LocalStateControllerOptions extends BaseOptions {
  [INJECT_COUNTER]: Counter;
  [INJECT_INPUT_MAPPER]: ActorInputMapper;
  [INJECT_LOGGER]: Logger;
  [INJECT_RANDOM]: RandomGenerator;
  [INJECT_SCRIPT]: ScriptController;
}

@Inject(INJECT_COUNTER, INJECT_INPUT_MAPPER, INJECT_LOGGER, INJECT_RANDOM, INJECT_SCRIPT)
export class LocalStateController implements StateController {
  protected counter: Counter;
  protected input: ActorInputMapper;
  protected logger: Logger;
  protected random: RandomGenerator;
  protected script: ScriptController;

  protected state?: State;
  protected world?: World;

  constructor(options: LocalStateControllerOptions) {
    this.counter = options[INJECT_COUNTER];
    this.input = options[INJECT_INPUT_MAPPER];
    this.logger = options[INJECT_LOGGER].child({
      kind: LocalStateController.name,
    });
    this.random = options[INJECT_RANDOM];
    this.script = options[INJECT_SCRIPT];
  }

  /**
   * Create a new world state from a world template.
   */
  async from(world: World, params: CreateParams): Promise<State> {
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

    // reseed the prng
    this.random.reseed(params.seed);

    // pick a starting room and create it
    const startRoomId = world.start.rooms[this.random.nextInt(world.start.rooms.length)];
    this.logger.debug({
      rooms: world.templates.rooms,
      startRoomId,
    }, 'generating start room');
    const startRoomTemplate = findByBaseId(world.templates.rooms, startRoomId);
    if (isNil(startRoomTemplate)) {
      throw new NotFoundError('invalid start room');
    }
    const startRoom = await this.createRoom(startRoomTemplate);

    // add to state
    state.focus.room = startRoom.meta.id;
    state.rooms.push(startRoom);

    // pick a starting actor and create it
    const startActorId = world.start.actors[this.random.nextInt(world.start.actors.length)];
    const startActorTemplate = findByBaseId(world.templates.actors, startActorId);
    if (isNil(startActorTemplate)) {
      throw new NotFoundError('invalid start actor');
    }
    const startActor = await this.createActor(startActorTemplate, ActorType.PLAYER);
    startActor.actorType = ActorType.PLAYER;

    // add to state and the start room
    state.focus.actor = startActor.meta.id;
    startRoom.actors.push(startActor);

    return state;
  }

  /**
   * Load an existing world state.
   */
  async load(state: State) {
    this.state = state;
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

    const scope: SuppliedScope = {
      data: {
        time,
      },
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

  protected async createActor(template: Template<Actor>, actorType = ActorType.DEFAULT): Promise<Actor> {
    const world = mustExist(this.world);

    const items = [];
    for (const itemTemplateId of template.base.items) {
      const itemTemplate = findByBaseId(world.templates.items, itemTemplateId.id);
      if (isNil(itemTemplate)) {
        throw new NotFoundError('invalid item in actor');
      }

      const item = await this.createItem(itemTemplate);
      items.push(item);
    }

    const actor: Actor = {
      type: 'actor',
      actorType,
      items,
      meta: {
        desc: template.base.meta.desc.base,
        id: `${template.base.meta.id.base}-${this.counter.next('actor')}`,
        name: template.base.meta.name.base,
        template: template.base.meta.id.base,
      },
      skills: renderNumberMap(template.base.skills),
      slots: renderStringMap(template.base.slots),
      stats: renderNumberMap(template.base.stats),
    };

    await this.input.add(actor);

    return actor;
  }

  protected async createItem(template: Template<Item>): Promise<Item> {
    return {
      type: 'item',
      meta: {
        desc: template.base.meta.desc.base,
        id: `${template.base.meta.id.base}-${this.counter.next('item')}`,
        name: template.base.meta.name.base,
        template: template.base.meta.id.base,
      },
      stats: renderNumberMap(template.base.stats),
      slots: renderStringMap(template.base.slots),
      verbs: renderVerbMap(template.base.verbs),
    };
  }

  protected async createRoom(template: Template<Room>, depth = PORTAL_DEPTH): Promise<Room> {
    const world = mustExist(this.world);

    const actors = [];
    for (const actorTemplateId of template.base.actors) {
      const actorTemplate = findByBaseId(world.templates.actors, actorTemplateId.id);
      this.logger.debug({
        actors: world.templates.actors,
        actorTemplateId,
        actorTemplate,
      }, 'create actor for room');

      if (isNil(actorTemplate)) {
        throw new NotFoundError('invalid actor in room');
      }

      const actor = await this.createActor(actorTemplate);
      actors.push(actor);
    }

    const items = [];
    for (const itemTemplateId of template.base.items) {
      const itemTemplate = findByBaseId(world.templates.items, itemTemplateId.id);
      this.logger.debug({
        items: world.templates.items,
        itemTemplateId,
        itemTemplate,
      }, 'create item for room');

      if (isNil(itemTemplate)) {
        throw new NotFoundError('invalid item in room');
      }

      const item = await this.createItem(itemTemplate);
      items.push(item);
    }

    return {
      type: 'room',
      actors,
      items,
      meta: {
        desc: template.base.meta.desc.base,
        id: `${template.base.meta.id.base}-${this.counter.next('room')}`,
        name: template.base.meta.name.base,
        template: template.base.meta.id.base,
      },
      portals: await this.populatePortals(template.base.portals, depth),
      slots: renderStringMap(template.base.slots),
      verbs: renderVerbMap(template.base.verbs),
    };
  }

  /**
   * Gather portal destinations from a room by group.
   */
  protected gatherPortals(template: Template<Room>): PortalGroups {
    const groups: PortalGroups = new Map();

    for (const portal of template.base.portals) {
      this.logger.debug({
        portal,
      }, 'grouping portal');
      const groupName = portal.group.base;
      const group = groups.get(groupName);

      if (group) {
        group.dests.add(portal.dest.base);
        group.sources.add(portal.name.base);
      } else {
        groups.set(groupName, {
          dests: new Set([portal.dest.base]),
          sources: new Set([portal.name.base]),
        });
      }
    }

    return groups;
  }

  protected async populatePortals(portals: Array<BaseTemplate<Portal>>, depth: number): Promise<Array<Portal>> {
    if (depth < 0) {
      return [];
    }

    // TODO: group first, union dests
    const groups: Map<string, string> = new Map();
    const results: Array<Portal> = [];

    for (const portal of portals) {
      const existing = groups.get(portal.group.base);

      if (doesExist(existing)) {
        results.push({
          dest: existing,
          group: renderString(portal.group),
          name: renderString(portal.name),
        });
      } else {
        const world = mustCoalesce(this.world);
        const destTemplateId = renderString(portal.dest);
        const destTemplate = findByBaseId(world.templates.rooms, destTemplateId);

        if (isNil(destTemplate)) {
          throw new NotFoundError('invalid room in portal dest');
        }

        const destRoom = await this.createRoom(destTemplate, depth - 1);
        mustExist(this.state).rooms.push(destRoom);

        results.push({
          dest: destRoom.meta.id,
          group: renderString(portal.group),
          name: renderString(portal.name),
        });
      }
    }

    return results;
  }

  protected populateV2() {
    // generate more rooms based on start room's doors

    /*
    const portalGroups = this.gatherPortals(startRoomTemplate);
    for (const [group, portal] of portalGroups) {
      const nextRoomId = Array.from(portal.dests)[this.random.nextInt(portal.dests.size)];
      this.logger.debug({
        nextRoomId,
        rooms: this.world.templates.rooms,
      }, 'generating next room');

      const nextRoomTemplate = this.world.templates.rooms.find((it) => it.base.meta.id.base === nextRoomId);
      if (isNil(nextRoomTemplate)) {
        throw new NotFoundError('invalid next room');
      }

      const nextRoom = this.createRoom(nextRoomTemplate);
      this.state.rooms.push(nextRoom);

      for (const portalName of portal.sources) {
        startRoom.portals.push({
          dest: nextRoom.meta.id,
          group,
          name: portalName,
        });
      }
    }
    */
  }
}