import { constructorName, doesExist, isNil, mustExist, mustFind, NotFoundError, Optional } from '@apextoaster/js-utils';
import { BaseOptions, Container, Inject, Logger } from 'noicejs';

import { CreateParams, StateService, StepResult } from '.';
import { NotInitializedError } from '../../error/NotInitializedError';
import { Command } from '../../model/Command';
import { Actor, ActorType, ACTOR_TYPE, isActor } from '../../model/entity/Actor';
import { DataFile } from '../../model/file/Data';
import { WorldState } from '../../model/world/State';
import { WorldTemplate } from '../../model/world/Template';
import { INJECT_COUNTER, INJECT_EVENT, INJECT_LOGGER, INJECT_RANDOM, INJECT_SCRIPT } from '../../module';
import { ShowVolume, StateSource } from '../../util/actor';
import { catchAndLog, onceEvent } from '../../util/async/event';
import { randomItem } from '../../util/collection/array';
import { StackMap } from '../../util/collection/StackMap';
import {
  EVENT_ACTOR_COMMAND,
  EVENT_ACTOR_JOIN,
  EVENT_COMMON_QUIT,
  EVENT_LOADER_DONE,
  EVENT_LOADER_READ,
  EVENT_LOADER_SAVE,
  EVENT_LOADER_STATE,
  EVENT_LOADER_WORLD,
  EVENT_LOCALE_BUNDLE,
  EVENT_STATE_JOIN,
  EVENT_STATE_LOAD,
  EVENT_STATE_OUTPUT,
  EVENT_STATE_ROOM,
  META_CREATE,
  META_DEBUG,
  META_GRAPH,
  META_HELP,
  META_LOAD,
  META_QUIT,
  META_SAVE,
  META_VERBS,
  META_WORLDS,
  SLOT_STEP,
  VERB_PREFIX,
  VERB_WAIT,
} from '../../util/constants';
import { getVerbScripts, searchState } from '../../util/state';
import { debugState, graphState } from '../../util/state/debug';
import { StateEntityGenerator } from '../../util/state/EntityGenerator';
import { StateEntityTransfer } from '../../util/state/EntityTransfer';
import { findByTemplateId } from '../../util/template';
import { ActorCommandEvent, ActorJoinEvent } from '../actor/events';
import { Counter } from '../counter';
import { EventBus } from '../event';
import { hasPath, LoaderReadEvent, LoaderStateEvent, LoaderWorldEvent } from '../loader/events';
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

  protected commands: StackMap<Actor, Command>;
  protected worlds: Array<WorldTemplate>;

  protected state?: WorldState;
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

    this.commands = new StackMap();
    this.worlds = [];
  }

  /**
   * Create a new world state from a world template.
   */
  public async create(params: CreateParams): Promise<WorldState> {
    this.logger.debug({ params, worlds: this.worlds.map((it) => it.meta.id) }, 'creating new world state');
    const generator = mustExist(this.generator);

    // find the world, prep the generator
    const world = mustFind(this.worlds, (it) => it.meta.id === params.id);
    generator.setWorld(world);

    // load the world locale
    this.event.emit('locale-bundle', {
      name: 'world',
      bundle: world.locale,
    });

    // reseed the prng
    this.random.reseed(params.seed); // TODO: fast-forward to last state

    // pick a starting room and populate it
    const roomRef = randomItem(world.start.rooms, this.random);
    const roomTemplate = findByTemplateId(world.templates.rooms, roomRef.id);
    if (isNil(roomTemplate)) {
      throw new NotFoundError('invalid start room');
    }

    this.logger.debug({
      roomRef,
      roomTemplate,
    }, 'creating start room');

    const startRoom = await generator.createRoom(roomTemplate);
    const rooms = await generator.populateRoom(startRoom, params.depth);
    rooms.unshift(startRoom);

    const meta = await generator.createMetadata(world.meta, 'world');
    this.state = {
      meta,
      rooms,
      start: {
        room: startRoom.meta.id,
      },
      step: {
        time: 0,
        turn: 0,
      },
      world: {
        ...params,
      },
    };

    mustExist(this.transfer).setState(this.state);

    return this.state;
  }

  /**
   * Load an existing world state.
   */
  public async load(state: WorldState): Promise<void> {
    this.state = state;
  }

  /**
   * Save the current world state.
   */
  public async save(): Promise<WorldState> {
    if (isNil(this.state)) {
      throw new NotInitializedError('state has not been initialized');
    }

    return this.state;
  }

  public async start(): Promise<void> {
    this.generator = await this.container.create(StateEntityGenerator);
    this.transfer = await this.container.create(StateEntityTransfer);

    this.event.on(EVENT_LOADER_WORLD, (event: LoaderWorldEvent) => {
      catchAndLog(this.onWorld(event.world), this.logger, 'error during world handler');
    }, this);

    this.event.on(EVENT_ACTOR_COMMAND, (event: ActorCommandEvent) => {
      catchAndLog(this.onCommand(event), this.logger, 'error during line handler');
    }, this);

    this.event.on(EVENT_ACTOR_JOIN, (event) => {
      catchAndLog(this.onJoin(event), this.logger, 'error during join handler');
    }, this);
  }

  public async stop(): Promise<void> {
    this.event.removeGroup(this);
  }

  public async onJoin(event: ActorJoinEvent): Promise<void> {
    const state = mustExist(this.state);
    const world = mustFind(this.worlds, (it) => it.meta.id === state.meta.template);

    // find an existing actor, if one exists
    const [existingActor] = searchState(state, {
      meta: {
        id: event.pid,
      },
      type: ACTOR_TYPE,
    });
    if (isActor(existingActor)) {
      this.event.emit(EVENT_STATE_JOIN, {
        actor: existingActor,
        pid: event.pid,
      });
      return;
    }

    // pick a starting actor and create it
    const actorRef = randomItem(world.start.actors, this.random);
    const actorTemplate = findByTemplateId(world.templates.actors, actorRef.id);
    if (isNil(actorTemplate)) {
      throw new NotFoundError('invalid start actor');
    }

    this.logger.debug({
      actorRef,
      actorTemplate,
    }, 'creating player actor');

    const actor = await mustExist(this.generator).createActor(actorTemplate, ActorType.PLAYER);
    actor.meta.id = event.pid;

    this.event.emit(EVENT_STATE_JOIN, {
      actor,
      pid: event.pid,
    });

    const room = mustFind(state.rooms, (it) => it.meta.id === state.start.room);
    room.actors.push(actor);

    this.event.emit(EVENT_STATE_ROOM, {
      actor,
      room,
    });

    await this.stepEnter({
      actor,
      room,
    });
  }

  public async onWorld(world: WorldTemplate): Promise<void> {
    this.logger.debug({ world: world.meta.id }, 'registering loaded world');
    this.worlds.push(world);
  }

  /**
   * Step the internal world state, simulating some turns and time passing.
   */
  public async onCommand(event: ActorCommandEvent): Promise<void> {
    const { actor, command } = event;

    this.logger.debug({
      actor,
      command,
    }, 'handling command event');

    if (doesExist(actor)) {
      this.commands.push(actor, command);
    }

    // handle meta commands
    switch (command.verb) {
      case META_CREATE:
        await this.doCreate(command.target, command.index);
        break;
      case META_DEBUG:
        await this.doDebug();
        break;
      case META_GRAPH:
        await this.doGraph(command.target);
        break;
      case META_HELP:
        await this.doHelp(actor);
        break;
      case META_LOAD:
        await this.doLoad(command.target);
        break;
      case META_QUIT:
        await this.doQuit();
        break;
      case META_SAVE:
        await this.doSave(command.target);
        break;
      case META_WORLDS:
        await this.doWorlds();
        break;
      default: {
        await this.doStep(actor);
      }
    }
  }

  public async doStep(actor: Optional<Actor>): Promise<void> {
    // if there is no world state, there won't be an actor, but this error is more informative
    if (isNil(this.state)) {
      this.event.emit(EVENT_STATE_OUTPUT, {
        line: 'meta.step.none',
        step: {
          time: 0,
          turn: 0,
        },
        volume: ShowVolume.WORLD,
      });
      return;
    }

    // TODO: proper wait, don't assume player goes last
    if (isNil(actor) || actor.actorType !== ActorType.PLAYER) {
      return;
    }

    // step world
    const result = await this.step();
    this.event.emit('state-step', result);

  }

  public async doCreate(target: string, depth: number): Promise<void> {
    const [id, seed] = target.split(' ');
    const state = await this.create({
      depth,
      id,
      seed,
    });

    this.event.emit(EVENT_STATE_OUTPUT, {
      context: {
        ...state.meta,
        depth,
        seed,
        world: id,
      },
      line: 'meta.create',
      step: {
        time: 0,
        turn: 0,
      },
      volume: ShowVolume.WORLD,
    });
    this.event.emit(EVENT_STATE_LOAD, {
      state: state.meta.name,
      world: state.meta.template,
    });
  }

  public async doDebug(): Promise<void> {
    if (isNil(this.state)) {
      this.event.emit(EVENT_STATE_OUTPUT, {
        line: 'meta.debug.none',
        step: {
          time: 0,
          turn: 0,
        },
        volume: ShowVolume.WORLD,
      });
      return;
    }

    const state = await this.save();
    const lines = debugState(state);

    for (const line of lines) {
      this.event.emit(EVENT_STATE_OUTPUT, {
        line,
        step: state.step,
        volume: ShowVolume.WORLD,
      });
    }
  }

  public async doGraph(path: string): Promise<void> {
    if (isNil(this.state)) {
      this.event.emit(EVENT_STATE_OUTPUT, {
        line: 'meta.graph.none',
        step: {
          time: 0,
          turn: 0,
        },
        volume: ShowVolume.WORLD,
      });
      return;
    }

    const state = await this.save();
    const lines = graphState(state);
    const data = lines.join('\n');

    this.event.emit(EVENT_LOADER_SAVE, {
      data,
      path,
    });

    this.event.emit(EVENT_STATE_OUTPUT, {
      context: {
        path,
        size: state.rooms.length,
      },
      line: 'debug.graph.summary',
      step: state.step,
      volume: ShowVolume.WORLD,
    });
  }

  public async doHelp(actor: Optional<Actor>): Promise<void> {
    const scripts = getVerbScripts(this.state, actor);
    const worldVerbs = Array.from(scripts.keys()).filter((it) => it.startsWith(VERB_PREFIX));
    const verbs = [
      ...worldVerbs,
      ...META_VERBS,
    ].sort()
      .map((it) => `$t(${it})`)
      .join(', ');

    this.event.emit(EVENT_STATE_OUTPUT, {
      context: {
        verbs,
      },
      line: 'meta.help',
      step: {
        time: 0,
        turn: 0,
      },
      volume: ShowVolume.WORLD,
    });
  }

  public async doLoad(path: string): Promise<void> {
    const doneEvent = onceEvent<LoaderReadEvent>(this.event, EVENT_LOADER_DONE);
    const stateEvent = onceEvent<LoaderStateEvent>(this.event, EVENT_LOADER_STATE);
    this.event.emit(EVENT_LOADER_READ, {
      path,
    });

    const event = await Promise.race([doneEvent, stateEvent]);
    if (hasPath(event)) {
      // done event arrived first, no states loaded
      this.event.emit(EVENT_STATE_OUTPUT, {
        context: {
          path,
        },
        line: 'meta.load.none',
        step: {
          time: 0,
          turn: 0,
        },
        volume: ShowVolume.WORLD,
      });
      return;
    }

    // was a state event
    const { state } = event;
    const world = mustFind(this.worlds, (it) => it.meta.id === state.meta.template);

    this.event.emit(EVENT_LOCALE_BUNDLE, {
      bundle: world.locale,
      name: 'world',
    });

    this.state = state;
    mustExist(this.generator).setWorld(world);
    mustExist(this.transfer).setState(state);

    this.event.emit(EVENT_STATE_OUTPUT, {
      context: {
        meta: state.meta,
        path,
      },
      line: 'meta.load.state',
      step: state.step,
      volume: ShowVolume.WORLD,
    });
  }

  public async doQuit(): Promise<void> {
    this.event.emit(EVENT_COMMON_QUIT);
  }

  public async doSave(path: string): Promise<void> {
    if (isNil(this.state)) {
      this.event.emit(EVENT_STATE_OUTPUT, {
        line: 'meta.save.none',
        step: {
          time: 0,
          turn: 0,
        },
        volume: ShowVolume.WORLD,
      });
      return;
    }

    const state = this.state;
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
      context: {
        meta: state.meta,
        path,
      },
      line: 'meta.save.state',
      step: state.step,
      volume: ShowVolume.WORLD,
    });
  }

  public async doWorlds(): Promise<void> {
    for (const world of this.worlds) {
      this.event.emit('state-output', {
        context: {
          id: world.meta.id,
          name: world.meta.name.base,
        },
        line: 'meta.world',
        step: {
          time: 0,
          turn: 0,
        },
        volume: ShowVolume.WORLD,
      });
    }
  }

  public async step(): Promise<StepResult> {
    if (isNil(this.state)) {
      throw new NotInitializedError('state has not been initialized');
    }

    const seen = new Set();
    const start = Date.now();

    const scope: SuppliedScope = {
      data: new Map(),
      random: this.random,
      state: this.state,
      stateHelper: {
        enter: (target) => this.stepEnter(target),
        quit: () => this.doQuit(),
        show: (msg, source, volume, context) => this.stepShow(msg, source, volume, context),
      },
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

            const command = await this.getActorCommand(actor);
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

    await this.notifyChangedRooms();

    return {
      time: this.state.step.time,
      turn: this.state.step.turn,
    };
  }

  /**
   * Handler for a line of input from the focus helper.
   */
  protected async stepShow(line: string, context?: LocaleContext, volume: ShowVolume = ShowVolume.WORLD, source?: StateSource): Promise<void> {
    this.event.emit(EVENT_STATE_OUTPUT, {
      line,
      context,
      source,
      step: mustExist(this.state).step,
      volume,
    });
  }

  protected async stepEnter(target: StateSource): Promise<void> {
    if (doesExist(target.actor) && target.actor.actorType === ActorType.PLAYER) {
      const state = mustExist(this.state);
      const rooms = await mustExist(this.generator).populateRoom(target.room, state.world.depth);
      state.rooms.push(...rooms);
    }
  }

  protected async getActorCommand(actor: Actor): Promise<Command> {
    const command = this.commands.pop(actor);

    if (doesExist(command)) {
      return command;
    }

    this.logger.warn({ actor }, 'no command queued for actor');
    return {
      index: 0,
      input: '',
      target: '',
      verb: VERB_WAIT,
    };
  }

  protected async notifyChangedRooms(): Promise<void> {
    const state = mustExist(this.state);
    for (const room of state.rooms) {
      for (const actor of room.actors) {
        this.event.emit(EVENT_STATE_ROOM, {
          actor,
          room,
        });
      }
    }
  }
}
