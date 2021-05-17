import { isNil, mustExist, NotFoundError } from '@apextoaster/js-utils';
import { BaseOptions, Container, Inject, Logger } from 'noicejs';

import { CreateParams, StateService, StepParams, StepResult } from '.';
import { WorldEntity } from '../../model/entity';
import { Actor, ACTOR_TYPE, ActorType, isActor } from '../../model/entity/Actor';
import { isItem, Item, ITEM_TYPE } from '../../model/entity/Item';
import { Portal, PortalGroups } from '../../model/entity/Portal';
import { isRoom, Room, ROOM_TYPE } from '../../model/entity/Room';
import { BaseTemplate, Template } from '../../model/meta/Template';
import { State } from '../../model/State';
import { World } from '../../model/World';
import {
  INJECT_COUNTER,
  INJECT_INPUT_ACTOR,
  INJECT_LOADER,
  INJECT_LOGGER,
  INJECT_RANDOM,
  INJECT_SCRIPT,
  INJECT_TEMPLATE,
} from '../../module';
import { ActorInputOptions } from '../../module/InputModule';
import { KNOWN_VERBS, SLOT_ENTER, SLOT_STEP } from '../../util/constants';
import { Counter } from '../../util/counter';
import { debugState, graphState } from '../../util/debug';
import { searchState, searchStateString } from '../../util/state';
import { findByTemplateId } from '../../util/template';
import { Input } from '../input';
import { Loader } from '../loader';
import { RandomGenerator } from '../random';
import { ScriptFocus, ScriptService, ScriptTransfer, SuppliedScope } from '../script';
import { TemplateService } from '../template';

export interface LocalStateServiceOptions extends BaseOptions {
  [INJECT_COUNTER]: Counter;
  [INJECT_LOADER]: Loader;
  [INJECT_LOGGER]: Logger;
  [INJECT_RANDOM]: RandomGenerator;
  [INJECT_SCRIPT]: ScriptService;
  [INJECT_TEMPLATE]: TemplateService;
}

@Inject(
  INJECT_COUNTER,
  INJECT_LOADER,
  INJECT_LOGGER,
  INJECT_RANDOM,
  INJECT_SCRIPT,
  INJECT_TEMPLATE)
export class LocalStateService implements StateService {
  /**
   * @todo remove. only present to get actor input.
   */
  protected container: Container;

  protected counter: Counter;
  protected loader: Loader;
  protected logger: Logger;
  protected random: RandomGenerator;
  protected script: ScriptService;
  protected template: TemplateService;

  protected buffer: Array<string>;
  protected focus?: ScriptFocus;
  protected transfer?: ScriptTransfer;

  protected state?: State;
  protected world?: World;

  constructor(options: LocalStateServiceOptions) {
    this.buffer = [];
    this.container = options.container;
    this.counter = options[INJECT_COUNTER];
    this.loader = options[INJECT_LOADER];
    this.logger = options[INJECT_LOGGER].child({
      kind: LocalStateService.name,
    });
    this.random = options[INJECT_RANDOM];
    this.script = options[INJECT_SCRIPT];
    this.template = options[INJECT_TEMPLATE];
  }

  /**
   * Create a new world state from a world template.
   */
  public async from(world: World, params: CreateParams): Promise<State> {
    const state: State = {
      world: {
        seed: params.seed,
        name: world.meta.name,
      },
      focus: {
        actor: '',
        room: '',
      },
      rooms: [],
      step: {
        time: 0,
        turn: 0,
      },
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
        const [room] = searchState(state, {
          meta: {
            id,
          },
          type: ROOM_TYPE,
        });

        if (isRoom(room)) {
          try {
            await this.populateRoom(room, params.depth);
          } catch (err) {
            this.logger.error(err, 'error populating room portals on focus');
          }

          state.focus.room = id;
        } else {
          throw new NotFoundError('invalid room for focus, does not exist in state');
        }
      },
      show: async (msg: string, _source?: WorldEntity) => {
        this.buffer.push(msg);
      },
    };

    this.transfer = {
      moveActor: async (id: string, source: string, dest: string) => {
        const [targetRoom] = searchState(state, {
          meta: {
            id: dest,
          },
          type: ROOM_TYPE,
        });
        if (!isRoom(targetRoom)) {
          this.logger.warn(`destination room ${dest} does not exist`);
          return;
        }

        const [currentRoom] = searchState(state, {
          meta: {
            id: source,
          },
          type: ROOM_TYPE,
        });

        if (!isRoom(currentRoom)) {
          this.logger.warn(`source room ${source} does not exist`);
          return;
        }

        const targetActor = mustExist(currentRoom.actors.find((it) => it.meta.id === id));

        // move the actor
        this.logger.debug({
          id,
          currentRoom,
          targetRoom,
        }, 'moving actor between rooms');
        currentRoom.actors.splice(currentRoom.actors.indexOf(targetActor), 1);
        targetRoom.actors.push(targetActor);

        await this.script.invoke(targetRoom, SLOT_ENTER, {
          actor: targetActor,
          data: {
            source,
          },
          focus: mustExist(this.focus),
          transfer: mustExist(this.transfer),
          state,
        });
      },
      moveItem: async (id: string, sourceId: string, destId: string) => {
        if (sourceId === destId) {
          this.logger.debug({ id, sourceId }, 'skipping transfer, source and dest are identical');
          return;
        }

        // find source entity
        const [source] = searchState(state, {
          meta: {
            id: sourceId,
          },
        });

        // find dest entity
        const [dest] = searchState(state, {
          meta: {
            id: destId,
          },
        });

        // find target item
        const [target] = searchStateString(state, {
          meta: id,
        });

        // ensure source and dest are both actor/room (types are greatly narrowed after these guards)
        if (isItem(source) || isItem(dest) || !isItem(target)) {
          this.logger.debug({ dest, source, target }, 'invalid entity type for item transfer');
          return;
        }

        const idx = source.items.indexOf(target);
        if (idx < 0) {
          this.logger.warn({ source, idx, target }, 'source does not directly contain target entity');
          return;
        }

        // move target from source to dest
        this.logger.debug({
          id,
          dest,
          source,
          target,
        }, 'moving item between entities');
        source.items.splice(idx, 1);
        dest.items.push(target);
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
    await this.populateRoom(startRoom, params.depth);

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
  public async load(state: State): Promise<void> {
    this.state = state;
  }

  /**
   * Save the current world state.
   */
  public async save(): Promise<State> {
    if (isNil(this.state)) {
      throw new Error('state has not been initialized');
    }

    return this.state;
  }

  /**
   * Step the internal world state, simulating some turns and time passing.
   */
  public async step(params: StepParams): Promise<StepResult> {
    const state = mustExist(this.state);

    const [player] = searchState(state, {
      meta: {
        id: state.focus.actor,
      },
      room: {
        id: state.focus.room,
      },
      type: ACTOR_TYPE,
    });
    if (!isActor(player)) {
      throw new Error('invalid focus actor');
    }

    const input = await this.getActorInput(player);
    const cmd = await input.parse(params.line);

    // handle meta commands
    switch (cmd.verb) {
      case 'debug': {
        const output = await debugState(state);
        return {
          ...params,
          output,
          stop: false,
          turn: state.step.turn,
        };
      }
      case 'graph': {
        const output = await graphState(state);
        await this.loader.saveStr(cmd.target, output.join('\n'));
        return {
          ...params,
          output: [
            `wrote ${state.rooms.length} node graph to ${cmd.target}`,
          ],
          stop: false,
          turn: state.step.turn,
        };
      }
      case 'help': {
        return {
          ...params,
          output: [
            KNOWN_VERBS.join(', '),
          ],
          stop: false,
          turn: state.step.turn,
        };
      }
      case 'quit':
        return {
          ...params,
          output: [],
          stop: true,
          turn: state.step.turn,
        };
      default: {
        // step world
        const output = await this.stepState(params.time);

        return {
          ...params,
          line: params.line,
          output,
          stop: false,
          time: state.step.time,
          turn: state.step.turn,
        };
      }
    }
  }


  public async stepState(time: number): Promise<Array<string>> {
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
            // TODO: make this better, somehow
            const input = await this.getActorInput(actor);
            const command = await input.last();

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
    }

    const spent = Date.now() - start;
    this.logger.debug({ spent, time }, 'finished world state step');

    this.state.step.turn += 1;
    this.state.step.time += spent;

    return this.buffer;
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

    const id = this.template.renderString(template.base.meta.id);
    return {
      type: 'actor',
      actorType,
      items,
      meta: {
        desc: this.template.renderString(template.base.meta.desc),
        id: `${id}-${this.counter.next('actor')}`,
        name: this.template.renderString(template.base.meta.name),
        template: template.base.meta.id.base, // should NOT be rendered
      },
      skills: this.template.renderNumberMap(template.base.skills),
      slots: this.template.renderStringMap(template.base.slots),
      stats: this.template.renderNumberMap(template.base.stats),
    };
  }

  protected async createItem(template: Template<Item>): Promise<Item> {
    const id = this.template.renderString(template.base.meta.id);
    return {
      type: ITEM_TYPE,
      meta: {
        desc: this.template.renderString(template.base.meta.desc),
        id: `${id}-${this.counter.next(ITEM_TYPE)}`,
        name: this.template.renderString(template.base.meta.name),
        template: template.base.meta.id.base,
      },
      stats: this.template.renderNumberMap(template.base.stats),
      slots: this.template.renderStringMap(template.base.slots),
      verbs: this.template.renderVerbMap(template.base.verbs),
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

    const id = this.template.renderString(template.base.meta.id);
    return {
      type: ROOM_TYPE,
      actors,
      items,
      meta: {
        desc: this.template.renderString(template.base.meta.desc),
        id: `${id}-${this.counter.next(ROOM_TYPE)}`,
        name: this.template.renderString(template.base.meta.name),
        template: template.base.meta.id.base,
      },
      portals: [],
      slots: this.template.renderStringMap(template.base.slots),
      verbs: this.template.renderVerbMap(template.base.verbs),
    };
  }

  /**
   * @todo get rid of this in favor of something that does not need a handle to the container
   */
  protected getActorInput(actor: Actor): Promise<Input> {
    return this.container.create<Input, ActorInputOptions>(INJECT_INPUT_ACTOR, {
      id: actor.meta.id,
      type: actor.actorType,
    });
  }

  /**
   * Gather portal destinations from a room by group.
   */
  protected groupPortals(portals: Array<BaseTemplate<Portal>>): PortalGroups {
    const groups: PortalGroups = new Map();

    for (const portal of portals) {
      this.logger.debug({
        portal,
      }, 'grouping portal');
      const groupName = this.template.renderString(portal.sourceGroup);
      const group = groups.get(groupName);

      if (group) {
        group.dests.add(this.template.renderString(portal.dest));
        group.portals.add(portal);
      } else {
        groups.set(groupName, {
          dests: new Set([
            this.template.renderString(portal.dest),
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

    const groups = this.groupPortals(portals);
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
        const name = this.template.renderString(portal.name);
        const targetGroup = this.template.renderString(portal.targetGroup);

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
    const portals = template.base.portals.filter((it) => {
      this.logger.debug({ it, room }, 'looking for portal matching template in room');

      return room.portals.some((p) =>
        p.name === it.name.base && p.sourceGroup === it.sourceGroup.base
      ) === false;
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
