import { constructorName, isNil, mustExist, mustFind, NotFoundError } from '@apextoaster/js-utils';
import { BaseOptions, Container, Inject, Logger } from 'noicejs';

import { CreateParams, StateService, StepResult } from '.';
import { NotInitializedError } from '../../error/NotInitializedError';
import { Command } from '../../model/Command';
import { Actor, ActorType } from '../../model/entity/Actor';
import { Room } from '../../model/entity/Room';
import { State } from '../../model/State';
import { World } from '../../model/World';
import {
  INJECT_ACTOR,
  INJECT_COUNTER,
  INJECT_EVENT,
  INJECT_LOADER,
  INJECT_LOGGER,
  INJECT_PARSER,
  INJECT_RANDOM,
  INJECT_SCRIPT,
} from '../../module';
import { ActorLocator } from '../../module/ActorModule';
import { randomItem } from '../../util/array';
import {
  COMMON_VERBS,
  META_CREATE,
  META_DEBUG,
  META_GRAPH,
  META_HELP,
  META_LOAD,
  META_QUIT,
  META_SAVE,
  SLOT_STEP,
} from '../../util/constants';
import { debugState, graphState } from '../../util/debug';
import { onceWithRemove } from '../../util/event';
import { StateEntityGenerator } from '../../util/state/EntityGenerator';
import { StateEntityTransfer } from '../../util/state/EntityTransfer';
import { StateFocusResolver } from '../../util/state/FocusResolver';
import { findByTemplateId } from '../../util/template';
import { Counter } from '../counter';
import { EventBus } from '../event';
import { LoaderService } from '../loader';
import { LocaleContext } from '../locale';
import { Parser } from '../parser';
import { RandomGenerator } from '../random';
import { ScriptService, SuppliedScope } from '../script';

export interface LocalStateServiceOptions extends BaseOptions {
  [INJECT_ACTOR]: ActorLocator;
  [INJECT_COUNTER]: Counter;
  [INJECT_EVENT]: EventBus;
  [INJECT_LOADER]: LoaderService;
  [INJECT_LOGGER]: Logger;
  [INJECT_PARSER]: Parser;
  [INJECT_RANDOM]: RandomGenerator;
  [INJECT_SCRIPT]: ScriptService;
}

@Inject(
  INJECT_ACTOR,
  INJECT_COUNTER,
  INJECT_EVENT,
  INJECT_LOADER,
  INJECT_LOGGER,
  INJECT_PARSER,
  INJECT_RANDOM,
  INJECT_SCRIPT
)
export class LocalStateService implements StateService {
  protected actor: ActorLocator;
  protected container: Container;
  protected counter: Counter;
  protected event: EventBus;
  protected loader: LoaderService;
  protected logger: Logger;
  protected parser: Parser;
  protected random: RandomGenerator;
  protected script: ScriptService;

  protected focus?: StateFocusResolver;
  protected generator?: StateEntityGenerator;
  protected transfer?: StateEntityTransfer;

  protected state?: State;
  protected worlds: Array<World>;

  constructor(options: LocalStateServiceOptions) {
    this.container = options.container;
    this.logger = options[INJECT_LOGGER].child({
      kind: constructorName(this),
    });

    this.actor = options[INJECT_ACTOR];
    this.counter = options[INJECT_COUNTER];
    this.event = options[INJECT_EVENT];
    this.loader = options[INJECT_LOADER];
    this.parser = options[INJECT_PARSER];
    this.random = options[INJECT_RANDOM];
    this.script = options[INJECT_SCRIPT];

    this.worlds = [];
  }

  /**
   * Create a new world state from a world template.
   */
  public async create(params: CreateParams): Promise<void> {
    const generator = mustExist(this.generator);

    // find the world, prep the generator
    const world = mustFind(this.worlds, (it) => it.meta.id === params.id);
    generator.setWorld(world);

    const meta = await generator.createMetadata(world.meta, 'world');
    this.state = {
      focus: {
        actor: '',
        room: '',
      },
      meta,
      rooms: [],
      start: {
        actor: '',
        room: '',
      },
      step: {
        time: 0,
        turn: 0,
      },
      world: {
        ...params,
      },
    };

    mustExist(this.focus).setState(this.state);
    mustExist(this.transfer).setState(this.state);

    // reseed the prng
    this.random.reseed(this.state.world.seed); // TODO: fast-forward to last state

    // load the world locale
    this.event.emit('locale-bundle', {
      name: 'world',
      bundle: mustExist(world).locale,
    });

    // pick a starting room and create it
    const startRoomRef = randomItem(world.start.rooms, this.random);
    const startRoomTemplate = findByTemplateId(world.templates.rooms, startRoomRef.id);
    if (isNil(startRoomTemplate)) {
      throw new NotFoundError('invalid start room');
    }

    this.logger.debug({
      startRoomRef,
      startRoomTemplate,
    }, 'creating start room');

    const startRoom = await generator.createRoom(startRoomTemplate);
    this.state.rooms.push(startRoom);

    // pick a starting actor and create it
    const startActorRef = randomItem(world.start.actors, this.random);
    const startActorTemplate = findByTemplateId(world.templates.actors, startActorRef.id);
    if (isNil(startActorTemplate)) {
      throw new NotFoundError('invalid start actor');
    }

    this.logger.debug({
      startActorRef,
      startActorTemplate,
    }, 'creating start actor');

    const startActor = await generator.createActor(startActorTemplate, ActorType.PLAYER);
    startActor.actorType = ActorType.PLAYER;
    startRoom.actors.push(startActor);

    // set initial focus
    const focus = mustExist(this.focus);
    await focus.setRoom(startRoom.meta.id);
    await focus.setActor(startActor.meta.id);

    // record starting location
    this.state.start.room = startRoom.meta.id;
    this.state.start.actor = startActor.meta.id;
  }

  /**
   * Load an existing world state.
   */
  public async load(state: State): Promise<void> {
    this.state = state;
  }

  public async start(): Promise<void> {
    await this.createHelpers();

    this.event.on('loader-world', (event) => {
      this.logger.debug({ event }, 'registering loaded world');
      this.worlds.push(event.world);
    });

    this.event.on('actor-command', (event) => {
      this.onCommand(event.command).catch((err) => {
        this.logger.error(err, 'error during line handler');
      });
    });
  }

  public async stop(): Promise<void> {
    const { pending } = onceWithRemove(this.event, 'quit');
    return pending;
  }

  /**
   * Save the current world state.
   */
  public async save(): Promise<State> {
    if (isNil(this.state)) {
      throw new NotInitializedError('state has not been initialized');
    }

    return this.state;
  }

  /**
   * Handler for a line of input from the focus helper.
   */
  public async onOutput(line: string, context?: LocaleContext): Promise<void> {
    this.event.emit('state-output', {
      lines: [{
        key: line,
        context,
      }],
      step: mustExist(this.state).step,
    });
  }

  /**
   * Step the internal world state, simulating some turns and time passing.
   */
  public async onCommand(cmd: Command): Promise<void> {
    this.logger.debug({
      cmd,
    }, 'handling input command');

    // handle meta commands
    switch (cmd.verb) {
      case META_CREATE:
        await this.doCreate(cmd.target, cmd.index);
        break;
      case META_DEBUG:
        await this.doDebug();
        break;
      case META_GRAPH:
        await this.doGraph(cmd.target);
        break;
      case META_HELP:
        await this.doHelp();
        break;
      case META_LOAD:
        await this.doLoad(cmd.target, cmd.index);
        break;
      case META_SAVE:
        await this.doSave(cmd.target);
        break;
      case META_QUIT:
        this.event.emit('quit');
        break;
      default: {
        // step world
        const result = await this.step();
        this.event.emit('state-step', result);
      }
    }
  }

  public async doCreate(target: string, depth: number): Promise<void> {
    const [id, seed] = target.split(' ');

    await this.create({
      depth,
      id,
      seed,
    });
  }

  public async doDebug(): Promise<void> {
    const state = await this.save();
    const lines = debugState(state);
    this.event.emit('state-output', {
      lines: lines.map((it) => ({ key: it })),
      step: state.step,
    });
  }

  public async doHelp(): Promise<void> {
    const verbs = COMMON_VERBS.map((it) => `$t(${it})`).join(', ');
    this.event.emit('state-output', {
      lines: [{
        key: verbs,
      }],
      // TODO: remove step from output?
      step: {
        time: 0,
        turn: 0,
      },
    });
  }

  public async doGraph(path: string): Promise<void> {
    const state = await this.save();
    const lines = graphState(state);

    await this.loader.saveStr(path, lines.join('\n'));

    this.event.emit('state-output', {
      lines: [{
        context: {
          path,
          size: state.rooms.length,
        },
        key: 'debug.graph.summary',
      }],
      step: state.step,
    });
  }

  public async doLoad(path: string, index: number): Promise<void> {
    const dataStr = await this.loader.loadStr(path);
    const data = this.parser.load(dataStr);
    const state = mustExist(data.state);

    this.state = state;
    await this.createHelpers();

    this.event.emit('state-output', {
      lines: [{
        key: `loaded world ${state.meta.id} state from ${path}`,
      }],
      step: state.step,
    });
  }

  public async doSave(path: string): Promise<void> {
    const state = mustExist(this.state);
    const world = mustFind(this.worlds, (it) => it.meta.id === state.meta.id);

    const dataStr = this.parser.save({
      state,
      worlds: [world],
    });
    await this.loader.saveStr(path, dataStr);

    this.event.emit('state-output', {
      lines: [{
        key: `saved world ${state.meta.id} state to ${path}`,
      }],
      step: state.step,
    });
  }

  public async step(): Promise<StepResult> {
    if (isNil(this.state)) {
      throw new NotInitializedError('state has not been initialized');
    }

    const seen = new Set();
    const start = Date.now();

    const scope: SuppliedScope = {
      data: new Map(),
      focus: mustExist(this.focus),
      random: this.random,
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
            seen.add(actor.meta.id);

            const command = await this.getActorCommand(actor, room);

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

  protected async getActorCommand(actor: Actor, room: Room): Promise<Command> {
    this.logger.debug({ actor }, 'getting actor command');

    this.event.emit('state-room', {
      actor,
      room,
    });

    const actorProxy = await this.actor.get({
      id: actor.meta.id,
      type: actor.actorType,
    });

    return actorProxy.last();
  }

  protected async createHelpers(): Promise<void> {
    // register focus
    this.focus = await this.container.create(StateFocusResolver, {
      events: {
        onActor: () => Promise.resolve(),
        onRoom: async (room) => this.onRoom(room),
        onShow: async (line, context) => this.onOutput(line, context),
      },
    });

    this.generator = await this.container.create(StateEntityGenerator);
    this.transfer = await this.container.create(StateEntityTransfer);
  }

  protected async onRoom(room: Room): Promise<void> {
    const state = mustExist(this.state);
    const rooms = await mustExist(this.generator).populateRoom(room, state.world.depth);
    state.rooms.push(...rooms);
  }
}
