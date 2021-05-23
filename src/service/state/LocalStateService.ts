import { constructorName, isNil, mustExist, NotFoundError } from '@apextoaster/js-utils';
import { EventEmitter } from 'events';
import { BaseOptions, Container, Inject, Logger } from 'noicejs';

import { CreateParams, StateService, StepResult } from '.';
import { Actor, ACTOR_TYPE, ActorType, isActor } from '../../model/entity/Actor';
import { Item, ITEM_TYPE } from '../../model/entity/Item';
import { Portal, PortalGroups } from '../../model/entity/Portal';
import { Room, ROOM_TYPE } from '../../model/entity/Room';
import { Metadata } from '../../model/meta/Metadata';
import { BaseTemplate, Template, TemplateMetadata } from '../../model/meta/Template';
import { State } from '../../model/State';
import { World } from '../../model/World';
import {
  INJECT_COUNTER,
  INJECT_INPUT_ACTOR,
  INJECT_LOADER,
  INJECT_LOCALE,
  INJECT_LOGGER,
  INJECT_PARSER,
  INJECT_RANDOM,
  INJECT_SCRIPT,
  INJECT_TEMPLATE,
} from '../../module';
import { ActorInputOptions } from '../../module/InputModule';
import { randomItem } from '../../util/array';
import {
  KNOWN_VERBS,
  META_DEBUG,
  META_GRAPH,
  META_HELP,
  META_LOAD,
  META_QUIT,
  META_SAVE,
  SLOT_STEP,
  TEMPLATE_CHANCE,
} from '../../util/constants';
import { Counter } from '../../util/counter';
import { debugState, graphState } from '../../util/debug';
import { onceWithRemove } from '../../util/event';
import { StateFocusResolver } from '../../util/state/focus';
import { searchState } from '../../util/state/search';
import { StateEntityTransfer } from '../../util/state/transfer';
import { findByTemplateId } from '../../util/template';
import { Input } from '../input';
import { Loader } from '../loader';
import { LocaleService } from '../locale';
import { Parser } from '../parser';
import { RandomGenerator } from '../random';
import { ScriptFocus, ScriptService, ScriptTransfer, SuppliedScope } from '../script';
import { TemplateService } from '../template';

export interface LocalStateServiceOptions extends BaseOptions {
  [INJECT_COUNTER]: Counter;
  [INJECT_LOADER]: Loader;
  [INJECT_LOCALE]: LocaleService;
  [INJECT_LOGGER]: Logger;
  [INJECT_PARSER]: Parser;
  [INJECT_RANDOM]: RandomGenerator;
  [INJECT_SCRIPT]: ScriptService;
  [INJECT_TEMPLATE]: TemplateService;
}

@Inject(
  INJECT_COUNTER,
  INJECT_LOADER,
  INJECT_LOCALE,
  INJECT_LOGGER,
  INJECT_PARSER,
  INJECT_RANDOM,
  INJECT_SCRIPT,
  INJECT_TEMPLATE
)
export class LocalStateService extends EventEmitter implements StateService {
  /**
   * @todo remove. only present to get actor input.
   */
  protected container: Container;

  protected counter: Counter;
  protected loader: Loader;
  protected locale: LocaleService;
  protected logger: Logger;
  protected parser: Parser;
  protected random: RandomGenerator;
  protected script: ScriptService;
  protected template: TemplateService;

  protected focus?: ScriptFocus;
  protected transfer?: ScriptTransfer;

  protected state?: State;
  protected world?: World;

  constructor(options: LocalStateServiceOptions) {
    super();

    this.container = options.container;
    this.counter = options[INJECT_COUNTER];
    this.loader = options[INJECT_LOADER];
    this.locale = options[INJECT_LOCALE];
    this.logger = options[INJECT_LOGGER].child({
      kind: constructorName(this),
    });
    this.parser = options[INJECT_PARSER];
    this.random = options[INJECT_RANDOM];
    this.script = options[INJECT_SCRIPT];
    this.template = options[INJECT_TEMPLATE];
  }

  /**
   * Create a new world state from a world template.
   */
  public async from(world: World, params: CreateParams): Promise<State> {
    const state: State = {
      focus: {
        actor: '',
        room: '',
      },
      meta: await this.createMetadata(world.meta, 'world'),
      rooms: [],
      step: {
        time: 0,
        turn: 0,
      },
      world: {
        ...params,
      },
    };

    // save state for later
    this.state = state;
    this.world = world;

    // register focus
    this.focus = new StateFocusResolver(this.state, {
      onActor: () => Promise.resolve(),
      onRoom: (room) => this.populateRoom(room, params.depth),
      onShow: async (line, context) => {
        const out = this.locale.translate(line, context);
        this.logger.debug({ line, out }, 'translated output');
        this.onOutput(out);
      },
    });
    this.transfer = new StateEntityTransfer(this.logger, this.state);

    // reseed the prng
    this.random.reseed(params.seed);

    // load the world locale
    this.locale.addBundle('world', world.locale);

    // pick a starting room and create it
    const startRoomRef = randomItem(world.start.rooms, this.random);
    this.logger.debug({
      rooms: world.templates.rooms,
      startRoomId: startRoomRef,
    }, 'generating start room');
    const startRoomTemplate = findByTemplateId(world.templates.rooms, startRoomRef.id);
    if (isNil(startRoomTemplate)) {
      throw new NotFoundError('invalid start room');
    }

    const startRoom = await this.createRoom(startRoomTemplate);
    state.rooms.push(startRoom);

    // pick a starting actor and create it
    const startActorRef = randomItem(world.start.actors, this.random);
    const startActorTemplate = findByTemplateId(world.templates.actors, startActorRef.id);
    if (isNil(startActorTemplate)) {
      throw new NotFoundError('invalid start actor');
    }

    const startActor = await this.createActor(startActorTemplate, ActorType.PLAYER);
    startActor.actorType = ActorType.PLAYER;
    startRoom.actors.push(startActor);

    // set initial focus
    await this.focus.setRoom(startRoom.meta.id);
    await this.focus.setActor(startActor.meta.id);

    // build out the world
    await this.populateRoom(startRoom, params.depth);

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

  public async loop(): Promise<void> {
    const { pending } = onceWithRemove<void>(this, 'quit');

    this.on('line', (line) => {
      this.onLine(line).catch((err) => {
        this.logger.error(err, 'error during line handler');
      });
    });

    return pending;
  }

  /**
   * Handler for a line of input from the focus helper.
   */
  public onOutput(line: string): void {
    this.emit('output', [line]);
  }

  /**
   * Step the internal world state, simulating some turns and time passing.
   */
  public async onLine(line: string): Promise<void> {
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
    const cmd = await input.parse(line);
    this.logger.debug({
      cmd,
      focus: state.focus,
      line,
      player,
    }, 'parsed line of player input');

    // handle meta commands
    switch (cmd.verb) {
      case META_DEBUG:
        this.emit('output', debugState(state));
        break;
      case META_GRAPH: {
        const output = graphState(state);
        await this.loader.saveStr(cmd.target, output.join('\n'));
        this.emit('output', [
          this.locale.translate('debug.graph', {
            cmd,
            size: state.rooms.length,
          }),
        ]);
        break;
      }
      case META_HELP:
        this.emit('output', [
          KNOWN_VERBS.join(', '),
        ]);
        break;
      case META_SAVE:
        await this.doSave(cmd.target);
        break;
      case META_LOAD:
        await this.doLoad(cmd.target, cmd.index);
        break;
      case META_QUIT:
        this.emit('quit');
        break;
      default: {
        // step world
        const result = await this.step();
        this.emit('step', result);
      }
    }
  }

  public async doLoad(path: string, index: number): Promise<void> {
    const dataStr = await this.loader.loadStr(path);
    const data = this.parser.load(dataStr);

    this.state = data.states[index];
    this.world = data.worlds[index]; // TODO: look up world based on state meta template

    this.emit('output', [
      `loaded world ${this.state.meta.id} state from ${path}`,
    ]);
  }

  public async doSave(path: string): Promise<void> {
    const state = mustExist(this.state);
    const world = mustExist(this.world);

    const dataStr = this.parser.save({
      states: [state],
      worlds: [world],
    });
    await this.loader.saveStr(path, dataStr);

    this.emit('output', [`saved world ${state.meta.id} state to ${path}`]);
  }

  public async step(): Promise<StepResult> {
    if (isNil(this.state)) {
      throw new Error('state has not been initialized');
    }

    const seen = new Set();
    const start = Date.now();

    const scope: SuppliedScope = {
      data: new Map(),
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
    this.state.step.turn += 1;
    this.state.step.time += spent;
    this.logger.debug({
      seen: seen.size,
      spent,
      step: this.state.step,
    }, 'finished world state step');

    return {
      time: this.state.step.time,
      turn: this.state.step.turn,
    };
  }

  protected async createActor(template: Template<Actor>, actorType = ActorType.DEFAULT): Promise<Actor> {
    const world = mustExist(this.world);

    const items = [];
    for (const itemTemplateRef of template.base.items) {
      if (this.random.nextInt(TEMPLATE_CHANCE) > itemTemplateRef.chance) {
        continue;
      }

      const itemTemplate = findByTemplateId(world.templates.items, itemTemplateRef.id);
      if (isNil(itemTemplate)) {
        throw new NotFoundError('invalid item in actor');
      }

      const item = await this.createItem(itemTemplate);
      items.push(item);
    }

    return {
      type: 'actor',
      actorType,
      items,
      meta: await this.createMetadata(template.base.meta, ACTOR_TYPE),
      skills: this.template.renderNumberMap(template.base.skills),
      slots: this.template.renderStringMap(template.base.slots),
      stats: this.template.renderNumberMap(template.base.stats),
    };
  }

  protected async createItem(template: Template<Item>): Promise<Item> {
    return {
      type: ITEM_TYPE,
      meta: await this.createMetadata(template.base.meta, ITEM_TYPE),
      stats: this.template.renderNumberMap(template.base.stats),
      slots: this.template.renderStringMap(template.base.slots),
      verbs: this.template.renderVerbMap(template.base.verbs),
    };
  }

  protected async createRoom(template: Template<Room>): Promise<Room> {
    const world = mustExist(this.world);

    const actors = [];
    for (const actorTemplateRef of template.base.actors) {
      if (this.random.nextInt(TEMPLATE_CHANCE) > actorTemplateRef.chance) {
        continue;
      }

      const actorTemplate = findByTemplateId(world.templates.actors, actorTemplateRef.id);
      this.logger.debug({
        actors: world.templates.actors,
        actorTemplateId: actorTemplateRef,
        actorTemplate,
      }, 'create actor for room');

      if (isNil(actorTemplate)) {
        throw new NotFoundError('invalid actor in room');
      }

      const actor = await this.createActor(actorTemplate);
      actors.push(actor);
    }

    const items = [];
    for (const itemTemplateRef of template.base.items) {
      if (this.random.nextInt(TEMPLATE_CHANCE) > itemTemplateRef.chance) {
        continue;
      }

      const itemTemplate = findByTemplateId(world.templates.items, itemTemplateRef.id);
      this.logger.debug({
        items: world.templates.items,
        itemTemplateId: itemTemplateRef,
        itemTemplate,
      }, 'create item for room');

      if (isNil(itemTemplate)) {
        throw new NotFoundError('invalid item in room');
      }

      const item = await this.createItem(itemTemplate);
      items.push(item);
    }

    return {
      type: ROOM_TYPE,
      actors,
      items,
      meta: await this.createMetadata(template.base.meta, ROOM_TYPE),
      portals: [],
      slots: this.template.renderStringMap(template.base.slots),
      verbs: this.template.renderVerbMap(template.base.verbs),
    };
  }

  protected async createMetadata(template: TemplateMetadata, type: string): Promise<Metadata> {
    return {
      desc: this.template.renderString(template.desc),
      id: `${template.id}-${this.counter.next(type)}`,
      name: this.template.renderString(template.name),
      template: template.id,
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
    const world = mustExist(this.world);

    for (const [sourceGroup, group] of groups) {
      const potentialDests = Array.from(group.dests);
      const destTemplateId = randomItem(potentialDests, this.random);
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
    this.logger.debug({
      portals,
      room,
    }, `populating ${portals.length} new portals of ${template.base.portals.length} in room ${room.meta.id}`);
    room.portals.push(...await this.populatePortals(portals, room.meta.id, depth));
  }
}
