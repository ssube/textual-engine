import { constructorName, isNil, mustExist, mustFind, NotFoundError } from '@apextoaster/js-utils';
import { BaseOptions, Container, Inject, Logger } from 'noicejs';

import { CreateParams, StateService, StepResult } from '.';
import { NotInitializedError } from '../../error/NotInitializedError';
import { Command } from '../../model/Command';
import { Actor, ActorType } from '../../model/entity/Actor';
import { Room } from '../../model/entity/Room';
import { DataFile } from '../../model/file/Data';
import { State } from '../../model/State';
import { World } from '../../model/World';
import { INJECT_COUNTER, INJECT_EVENT, INJECT_LOGGER, INJECT_RANDOM, INJECT_SCRIPT } from '../../module';
import { randomItem } from '../../util/array';
import { catchAndLog, onceEvent } from '../../util/async/event';
import {
  COMMON_VERBS,
  EVENT_ACTOR_COMMAND,
  EVENT_COMMON_QUIT,
  EVENT_LOADER_READ,
  EVENT_LOADER_SAVE,
  EVENT_LOADER_STATE,
  EVENT_LOADER_WORLD,
  EVENT_LOCALE_BUNDLE,
  EVENT_STATE_OUTPUT,
  EVENT_STATE_ROOM,
  META_CREATE,
  META_DEBUG,
  META_GRAPH,
  META_HELP,
  META_LOAD,
  META_QUIT,
  META_SAVE,
  SLOT_STEP,
} from '../../util/constants';
import { debugState, graphState } from '../../util/state/debug';
import { StateEntityGenerator } from '../../util/state/EntityGenerator';
import { StateEntityTransfer } from '../../util/state/EntityTransfer';
import { StateFocusResolver } from '../../util/state/FocusResolver';
import { findByTemplateId } from '../../util/template';
import { Counter } from '../counter';
import { CommandEvent, EventBus } from '../event';
import { LoaderStateEvent, LoaderWorldEvent } from '../loader';
import { LocaleContext } from '../locale';
import { RandomGenerator } from '../random';
import { ScriptService, SuppliedScope } from '../script';

export interface LocalStateServiceOptions extends BaseOptions {
  [INJECT_COUNTER]?: Counter;
  [INJECT_EVENT]?: EventBus;
  [INJECT_LOGGER]?: Logger;
  [INJECT_RANDOM]?: RandomGenerator;
  [INJECT_SCRIPT]?: ScriptService;
}

@Inject(
  INJECT_COUNTER,
  INJECT_EVENT,
  INJECT_LOGGER,
  INJECT_RANDOM,
  INJECT_SCRIPT
)
export class LocalStateService implements StateService {
  protected container: Container;
  protected counter: Counter;
  protected event: EventBus;
  protected logger: Logger;
  protected random: RandomGenerator;
  protected script: ScriptService;

  protected worlds: Array<World>;

  protected state?: State;
  protected focus?: StateFocusResolver;
  protected generator?: StateEntityGenerator;
  protected transfer?: StateEntityTransfer;

  constructor(options: LocalStateServiceOptions) {
    this.container = options.container;
    this.logger = mustExist(options[INJECT_LOGGER]).child({
      kind: constructorName(this),
    });

    this.counter = mustExist(options[INJECT_COUNTER]);
    this.event = mustExist(options[INJECT_EVENT]);
    this.random = mustExist(options[INJECT_RANDOM]);
    this.script = mustExist(options[INJECT_SCRIPT]);

    this.worlds = [];
  }

  /**
   * Create a new world state from a world template.
   */
  public async create(params: CreateParams): Promise<State> {
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

    return this.state;
  }

  /**
   * Load an existing world state.
   */
  public async load(state: State): Promise<void> {
    this.state = state;
  }

  public async start(): Promise<void> {
    this.focus = await this.container.create(StateFocusResolver, {
      events: {
        onActor: () => Promise.resolve(),
        onQuit: () => this.doQuit(),
        onRoom: (room) => this.onRoom(room),
        onShow: (line, context) => this.onOutput(line, context),
      },
    });

    this.generator = await this.container.create(StateEntityGenerator);
    this.transfer = await this.container.create(StateEntityTransfer);

    this.event.on(EVENT_LOADER_WORLD, (event: LoaderWorldEvent) => {
      catchAndLog(this.onWorld(event.world), this.logger, 'error during world handler');
    }, this);

    this.event.on(EVENT_ACTOR_COMMAND, (event: CommandEvent) => {
      if (event.actor.actorType === ActorType.PLAYER) {
        catchAndLog(this.onCommand(event.command), this.logger, 'error during line handler');
      }
    }, this);
  }

  public async stop(): Promise<void> {
    this.event.removeGroup(this);
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
    this.event.emit(EVENT_STATE_OUTPUT, {
      lines: [{
        key: line,
        context,
      }],
      step: mustExist(this.state).step,
    });
  }

  public async onWorld(world: World): Promise<void> {
    this.logger.debug({ world: world.meta.id }, 'registering loaded world');
    this.worlds.push(world);
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
      case META_QUIT:
        await this.doQuit();
        break;
      case META_SAVE:
        await this.doSave(cmd.target);
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
    const state = await this.create({
      depth,
      id,
      seed,
    });

    this.event.emit(EVENT_STATE_OUTPUT, {
      lines: [{
        key: 'meta.create',
        context: {
          ...state.meta,
          depth,
          seed,
          world: id,
        },
      }],
      step: {
        time: 0,
        turn: 0,
      },
    });
  }

  public async doDebug(): Promise<void> {
    const state = await this.save();
    const lines = debugState(state);
    this.event.emit(EVENT_STATE_OUTPUT, {
      lines: lines.map((it) => ({ key: it })),
      step: state.step,
    });
  }

  public async doHelp(): Promise<void> {
    const verbs = COMMON_VERBS.map((it) => `$t(${it})`).join(', ');
    this.event.emit(EVENT_STATE_OUTPUT, {
      lines: [{
        key: 'meta.help',
        context: {
          verbs,
        }
      }],
      step: {
        time: 0,
        turn: 0,
      },
    });
  }

  public async doGraph(path: string): Promise<void> {
    const state = await this.save();
    const lines = graphState(state);
    const data = lines.join('\n');

    this.event.emit(EVENT_LOADER_SAVE, {
      data,
      path,
    });

    this.event.emit(EVENT_STATE_OUTPUT, {
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
    const stateEvent = onceEvent<LoaderStateEvent>(this.event, EVENT_LOADER_STATE);
    this.event.emit(EVENT_LOADER_READ, {
      path,
    });

    const { state } = await stateEvent;
    const world = mustFind(this.worlds, (it) => it.meta.id === state.meta.template);

    this.event.emit(EVENT_LOCALE_BUNDLE, {
      bundle: world.locale,
      name: 'world',
    });

    this.state = state;
    mustExist(this.focus).setState(state);
    mustExist(this.generator).setWorld(world);
    mustExist(this.transfer).setState(state);

    this.event.emit(EVENT_STATE_OUTPUT, {
      lines: [{
        key: `loaded world ${state.meta.id} state from ${path}`,
      }],
      step: state.step,
    });
  }

  public async doQuit(): Promise<void> {
    this.event.emit(EVENT_COMMON_QUIT);
  }

  public async doSave(path: string): Promise<void> {
    const state = mustExist(this.state);
    const world = mustFind(this.worlds, (it) => it.meta.id === state.meta.template);

    const data: DataFile = {
      state,
      worlds: [world],
    };

    this.event.emit(EVENT_LOADER_SAVE, {
      data,
      path,
    });

    this.event.emit(EVENT_STATE_OUTPUT, {
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

    const pending = onceEvent<CommandEvent>(this.event, EVENT_ACTOR_COMMAND);

    this.event.emit(EVENT_STATE_ROOM, {
      actor,
      room,
    });

    const { command } = await pending;
    return command;
  }

  protected async onRoom(room: Room): Promise<void> {
    const state = mustExist(this.state);
    const rooms = await mustExist(this.generator).populateRoom(room, state.world.depth);
    state.rooms.push(...rooms);
  }
}
