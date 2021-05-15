import { isNil, mustExist, NotFoundError } from '@apextoaster/js-utils';
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
import { PORTAL_DEPTH, SLOT_ENTER, SLOT_STEP } from '../../util/constants';
import { Counter } from '../../util/counter';
import { findByTemplateId, renderNumberMap, renderString, renderStringMap, renderVerbMap } from '../../util/template';
import { ActorInputMapper } from '../input/ActorInputMapper';
import { RandomGenerator } from '../random';
import { ScriptController, ScriptFocus, ScriptRender, ScriptTransfer, SuppliedScope } from '../script';

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

  protected buffer: Array<string>;
  protected focus?: ScriptFocus;
  protected render?: ScriptRender;
  protected transfer?: ScriptTransfer;

  protected state?: State;
  protected world?: World;

  constructor(options: LocalStateControllerOptions) {
    this.buffer = [];
    this.counter = options[INJECT_COUNTER];
    this.input = options[INJECT_INPUT_MAPPER];
    this.logger = options[INJECT_LOGGER].child({
      kind: LocalStateController.name,
    });
    this.random = options[INJECT_RANDOM];
    this.script = options[INJECT_SCRIPT];
  }

  async getBuffer() {
    return this.buffer;
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

    // register focus
    this.focus = {
      setActor: async (id: string) => {
        state.focus.actor = id;
      },
      setRoom: async (id: string) => {
        const room = mustExist(this.state).rooms.find((it) => it.meta.id === id);
        if (isNil(room)) {
          throw new NotFoundError('invalid room for focus, does not exist in state');
        }

        try {
          await this.populateRoom(room, PORTAL_DEPTH);
        } catch (err) {
          this.logger.error(err, 'error populating room portals on focus');
        }

        state.focus.room = id;
      }
    };

    this.render = {
      read: async (prompt: string) => {
        throw new Error('method not implemented');
      },
      show: async (msg: string) => {
        this.buffer.push(msg);
      },
    }

    this.transfer = {
      moveActor: async (id: string, source: string, dest: string) => {
        const targetRoom = state.rooms.find((it) => it.meta.id === dest);
        if (isNil(targetRoom)) {
          this.logger.warn(`destination room ${dest} does not exist`);
          return;
        }

        const currentRoom = mustExist(state.rooms.find((it) => it.meta.id === source));
        const targetActor = mustExist(currentRoom.actors.find((it) => it.meta.id === id));

        // move the actor
        this.logger.debug(`${id} is moving to from ${currentRoom.meta.name} (${currentRoom.meta.id}) to ${targetRoom.meta.name} (${targetRoom.meta.id})`);
        currentRoom.actors.splice(currentRoom.actors.indexOf(targetActor), 1);
        targetRoom.actors.push(targetActor);

        await this.script.invoke(targetRoom, SLOT_ENTER, {
          actor: targetActor,
          data: {
            source,
          },
          focus: mustExist(this.focus),
          render: mustExist(this.render),
          transfer: mustExist(this.transfer),
          state,
        });
      },
      moveItem: async (id: string, source: string, dest: string) => {
        throw new Error('method not implemented');
      },
    };

    // reseed the prng
    this.random.reseed(params.seed);

    // pick a starting room and create it
    const startRoomId = world.start.rooms[this.random.nextInt(world.start.rooms.length)];
    this.logger.debug({
      rooms: world.templates.rooms,
      startRoomId,
    }, 'generating start room');
    const startRoomTemplate = findByTemplateId(world.templates.rooms, startRoomId);
    if (isNil(startRoomTemplate)) {
      throw new NotFoundError('invalid start room');
    }

    const startRoom = await this.createRoom(startRoomTemplate);
    await this.populateRoom(startRoom, PORTAL_DEPTH);

    // add to state
    state.focus.room = startRoom.meta.id;
    state.rooms.push(startRoom);

    // pick a starting actor and create it
    const startActorId = world.start.actors[this.random.nextInt(world.start.actors.length)];
    const startActorTemplate = findByTemplateId(world.templates.actors, startActorId);
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

    this.buffer = [];

    const seen = new Set();
    const start = Date.now();

    const scope: SuppliedScope = {
      data: {
        time,
      },
      focus: mustExist(this.focus),
      render: mustExist(this.render),
      state: this.state,
      transfer: mustExist(this.transfer),
    };

    for (const room of this.state.rooms) {
      if (seen.has(room.meta.id) === false) {
        seen.add(room.meta.id);
        await this.script.invoke(room, SLOT_STEP, {
          ...scope,
          room,
        });

        for (const actor of room.actors) {
          if (seen.has(actor.meta.id) === false) {
            const input = await this.input.get(actor);
            const [command] = await input.last();

            seen.add(actor.meta.id);
            await this.script.invoke(actor, SLOT_STEP, {
              ...scope,
              actor,
              command,
              room,
            });

            for (const item of actor.items) {
              if (seen.has(item.meta.id) === false) {
                seen.add(item.meta.id);
                await this.script.invoke(item, SLOT_STEP, {
                  ...scope,
                  actor,
                  item,
                  room,
                });
              }
            }
          }

          for (const item of room.items) {
            if (seen.has(item.meta.id) === false) {
              seen.add(item.meta.id);
              await this.script.invoke(item, SLOT_STEP, {
                ...scope,
                item,
                room,
              });
            }
          }
        }
      }

      const spent = Date.now() - start;
      this.logger.debug({ spent, time }, 'finished world state step');
    }
  }

  protected async createActor(template: Template<Actor>, actorType = ActorType.DEFAULT): Promise<Actor> {
    const world = mustExist(this.world);

    const items = [];
    for (const itemTemplateId of template.base.items) {
      const itemTemplate = findByTemplateId(world.templates.items, itemTemplateId.id);
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

  protected async createRoom(template: Template<Room>): Promise<Room> {
    const world = mustExist(this.world);

    const actors = [];
    for (const actorTemplateId of template.base.actors) {
      const actorTemplate = findByTemplateId(world.templates.actors, actorTemplateId.id);
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
      const itemTemplate = findByTemplateId(world.templates.items, itemTemplateId.id);
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
      portals: [],
      slots: renderStringMap(template.base.slots),
      verbs: renderVerbMap(template.base.verbs),
    };
  }

  /**
   * Gather portal destinations from a room by group.
   */
  protected gatherPortals(portals: Array<BaseTemplate<Portal>>): PortalGroups {
    const groups: PortalGroups = new Map();

    for (const portal of portals) {
      this.logger.debug({
        portal,
      }, 'grouping portal');
      const groupName = renderString(portal.sourceGroup);
      const group = groups.get(groupName);

      if (group) {
        group.dests.add(renderString(portal.dest));
        group.portals.add(portal);
      } else {
        groups.set(groupName, {
          dests: new Set([
            renderString(portal.dest),
          ]),
          portals: new Set([portal]),
        });
      }
    }

    this.logger.debug({ groups: Object.fromEntries(groups.entries()) }, 'grouped portals');

    return groups;
  }

  protected async populatePortals(portals: Array<BaseTemplate<Portal>>, sourceId: string, depth: number): Promise<Array<Portal>> {
    if (depth < 0) {
      return [];
    }

    const groups = this.gatherPortals(portals);
    const results: Array<Portal> = [];

    for (const [sourceGroup, group] of groups) {
      const world = mustExist(this.world);
      const destTemplateId = Array.from(group.dests)[0];
      const destTemplate = findByTemplateId(world.templates.rooms, destTemplateId);

      if (isNil(destTemplate)) {
        throw new NotFoundError('invalid room in portal dest');
      }

      this.logger.debug({ destTemplateId, group, sourceGroup }, 'linking source group to destination template');

      const destRoom = await this.createRoom(destTemplate);
      mustExist(this.state).rooms.push(destRoom);

      for (const portal of group.portals) {
        const name = renderString(portal.name);
        const targetGroup = renderString(portal.targetGroup);

        results.push({
          name,
          sourceGroup,
          targetGroup,
          dest: destRoom.meta.id,
        });

        destRoom.portals.push({
          name,
          sourceGroup: targetGroup,
          targetGroup: sourceGroup,
          dest: sourceId,
        });
      }

      await this.populateRoom(destRoom, depth - 1);
    }

    return results;
  }

  protected async populateRoom(room: Room, depth: number): Promise<void> {
    if (depth < 0) {
      return;
    }

    // get template
    const template = findByTemplateId(mustExist(this.world).templates.rooms, room.meta.template);
    // TODO: filter out previously-created destination portals
    const portals = template.base.portals.filter((it) => {
      this.logger.debug({ it, room }, 'looking for portal matching template in room');

      return room.portals.some((p) => {
        return p.name === it.name.base && p.sourceGroup === it.sourceGroup.base;
      }) === false;
    });

    if (portals.length === 0) {
      this.logger.debug({ room }, 'portals have already been populated');
      return;
    }

    // extend map
    this.logger.debug(`populating ${portals.length} new portals of ${template.base.portals.length} in room ${room.meta.id}`);
    room.portals.push(...await this.populatePortals(portals, room.meta.id, depth));
  }
}