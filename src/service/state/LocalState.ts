/* eslint-disable max-lines */
import { doesExist, isNil, mustExist, mustFind, NotFoundError } from '@apextoaster/js-utils';
import { Container, Inject, Logger } from 'noicejs';

import { StateService, StepResult } from '.';
import { ActorRoomError } from '../../error/ActorRoomError';
import { NotInitializedError } from '../../error/NotInitializedError';
import { ScriptTargetError } from '../../error/ScriptTargetError';
import { Command } from '../../model/Command';
import { EntityForType, WorldEntityType } from '../../model/entity';
import { Actor, ACTOR_TYPE, ActorSource, isActor } from '../../model/entity/Actor';
import { isRoom, Room } from '../../model/entity/Room';
import { DataFile } from '../../model/file/Data';
import { WorldState } from '../../model/world/State';
import { WorldTemplate } from '../../model/world/Template';
import { INJECT_COUNTER, INJECT_EVENT, INJECT_LOGGER, INJECT_RANDOM, INJECT_SCRIPT, InjectedOptions } from '../../module';
import { ShowVolume, StateSource } from '../../util/actor';
import { CompletionSet } from '../../util/async/CompletionSet';
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
  EVENT_STATE_STEP,
  META_CREATE,
  META_DEBUG,
  META_GRAPH,
  META_HELP,
  META_LOAD,
  META_QUIT,
  META_SAVE,
  META_VERBS,
  META_WORLDS,
  SIGNAL_STEP,
  SPLIT_HEAD_TAIL,
  VERB_PREFIX,
} from '../../util/constants';
import { getVerbScripts } from '../../util/script';
import { makeServiceLogger } from '../../util/service';
import { debugState, graphState } from '../../util/entity/debug';
import { StateEntityGenerator } from '../../util/entity/EntityGenerator';
import {
  ActorTransfer,
  isActorTransfer,
  isItemTransfer,
  ItemTransfer,
  StateEntityTransfer,
} from '../../util/entity/EntityTransfer';
import { findMatching, findRoom, SearchFilter } from '../../util/entity/find';
import { findByBaseId } from '../../util/template';
import { ActorCommandEvent, ActorJoinEvent } from '../actor/events';
import { Counter } from '../counter';
import { EventBus } from '../event';
import { hasState, LoaderReadEvent, LoaderStateEvent, LoaderWorldEvent } from '../loader/events';
import { LocaleContext } from '../locale';
import { RandomGenerator } from '../random';
import { ScriptContext, ScriptService, SuppliedScope } from '../script';

@Inject(
  INJECT_COUNTER,
  INJECT_EVENT,
  INJECT_LOGGER,
  INJECT_RANDOM,
  INJECT_SCRIPT,
)
export class LocalStateService implements StateService {
  protected container: Container;
  protected counter: Counter;
  protected event: EventBus;
  protected logger: Logger;
  protected random: RandomGenerator;
  protected script: ScriptService;

  protected commandBuffer: StackMap<Actor, Command>;
  protected commandQueue: CompletionSet<Actor>;
  protected worlds: Array<WorldTemplate>;

  protected state?: WorldState;
  protected generator?: StateEntityGenerator;
  protected transfer?: StateEntityTransfer;

  constructor(options: InjectedOptions) {
    this.container = options.container;
    this.counter = mustExist(options[INJECT_COUNTER]);
    this.event = mustExist(options[INJECT_EVENT]);
    this.logger = makeServiceLogger(options[INJECT_LOGGER], this);
    this.random = mustExist(options[INJECT_RANDOM]);
    this.script = mustExist(options[INJECT_SCRIPT]);

    this.commandBuffer = new StackMap();
    this.commandQueue = new CompletionSet();
    this.worlds = [];
  }

  public async start(): Promise<void> {
    // TODO: should be injected
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

  // #region event handlers
  /**
   * Step the internal world state, simulating some turns and time passing.
   */
  public async onCommand(event: ActorCommandEvent): Promise<void> {
    const { actor, command } = event;

    this.logger.debug({
      actor,
      command,
    }, 'handling command event');

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
        await this.doHelp(event);
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
        await this.doStep(event);
      }
    }
  }

  /**
   * A new player is joining and their actor must be found or created.
   */
  public async onJoin(event: ActorJoinEvent): Promise<void> {
    const state = mustExist(this.state);
    const world = mustFind(this.worlds, (it) => it.meta.id === state.meta.template);

    // find an existing actor, if one exists
    const [existingActor] = findMatching(state, {
      meta: {
        id: event.pid,
      },
      type: ACTOR_TYPE,
    });
    if (isActor(existingActor)) {
      const [room] = findRoom(state, {
        meta: {
          id: existingActor.meta.id,
        },
      });

      if (!isRoom(room)) {
        throw new ActorRoomError('room cannot be found for existing actor');
      }

      this.event.emit(EVENT_STATE_JOIN, {
        actor: existingActor,
        pid: event.pid,
        room,
      });
    } else {
      // pick a starting actor and create it
      const actorRef = randomItem(world.start.actors, this.random);
      const actorTemplate = findByBaseId(world.templates.actors, actorRef.id);
      if (isNil(actorTemplate)) {
        throw new NotFoundError('invalid start actor');
      }

      this.logger.debug({
        template: actorTemplate,
      }, 'creating player actor from template');

      const actor = await mustExist(this.generator).createActor(actorTemplate, ActorSource.PLAYER);
      actor.meta.id = event.pid;

      this.logger.debug({
        actor,
      }, 'created player actor, placing in room');

      const room = mustFind(state.rooms, (it) => it.meta.id === state.start.room);
      room.actors.push(actor);

      this.logger.debug({
        pid: event.pid,
      }, 'emitting player join event');
      this.event.emit(EVENT_STATE_JOIN, {
        actor,
        pid: event.pid,
        room,
      });

      this.logger.debug({ actor, room }, 'player entering room');
      await this.stepEnter({
        actor,
        room,
      });
    }
  }

  /**
   * A new world has been loaded and needs to be registered.
   */
  public async onWorld(world: WorldTemplate): Promise<void> {
    this.logger.debug({ world: world.meta.id }, 'registering loaded world');
    this.worlds.push(world);
  }
  // #endregion event handlers

  // #region meta commands
  /**
   * Create a new world and invite players to join.
   */
  public async doCreate(target: string, depth: number): Promise<void> {
    const generator = mustExist(this.generator);

    const [id, seed] = target.split(' ', SPLIT_HEAD_TAIL);
    this.logger.debug({
      depth,
      id,
      seed,
      worlds: this.worlds.map((it) => it.meta.id),
    }, 'creating new world state');

    // find the world, prep the generator
    const world = mustFind(this.worlds, (it) => it.meta.id === id);

    // load the world locale
    this.event.emit(EVENT_LOCALE_BUNDLE, {
      name: 'world',
      bundle: world.locale,
    });

    // create a state
    generator.setWorld(world);
    this.state = await generator.createState(world, {
      depth,
      id,
      seed,
    });

    this.event.emit(EVENT_STATE_OUTPUT, {
      context: {
        depth,
        seed,
        state: this.state.meta,
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
      state: this.state.meta.name,
      world: this.state.meta.template,
    });
  }

  /**
   * Print debug representation of the world state.
   */
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

    const lines = debugState(this.state);

    for (const line of lines) {
      this.event.emit(EVENT_STATE_OUTPUT, {
        line,
        step: this.state.step,
        volume: ShowVolume.WORLD,
      });
    }
  }

  /**
   * Print graphviz representation of the world state.
   */
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

    const lines = graphState(this.state);
    const data = lines.join('\n');

    this.event.emit(EVENT_LOADER_SAVE, {
      data,
      path,
    });

    this.event.emit(EVENT_STATE_OUTPUT, {
      context: {
        path,
        size: this.state.rooms.length,
      },
      line: 'debug.graph.summary',
      step: this.state.step,
      volume: ShowVolume.WORLD,
    });
  }

  /**
   * Print available verbs.
   */
  public async doHelp(event: ActorCommandEvent): Promise<void> {
    const scripts = getVerbScripts(event);
    const worldVerbs = Array.from(scripts.keys()).filter((it) => it.startsWith(VERB_PREFIX));

    this.logger.debug({ event, worldVerbs }, 'collected world verbs for help');
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

  /**
   * Load world state and/or templates from path.
   */
  public async doLoad(path: string): Promise<void> {
    const doneEvent = onceEvent<LoaderReadEvent>(this.event, EVENT_LOADER_DONE);
    const stateEvent = onceEvent<LoaderStateEvent>(this.event, EVENT_LOADER_STATE);
    this.event.emit(EVENT_LOADER_READ, {
      path,
    });

    const event = await Promise.race([doneEvent, stateEvent]);
    if (!hasState(event)) {
      this.logger.debug({ event }, 'path read event received first');
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

    this.logger.debug({ bundle: world.locale }, 'loading world locale bundle');
    this.event.emit(EVENT_LOCALE_BUNDLE, {
      bundle: world.locale,
      name: 'world',
    });

    this.state = state;
    mustExist(this.generator).setWorld(world);

    this.logger.debug('emitting state loaded event');
    this.event.emit(EVENT_STATE_OUTPUT, {
      context: {
        meta: state.meta,
        path,
      },
      line: 'meta.load.state',
      step: state.step,
      volume: ShowVolume.WORLD,
    });

    this.event.emit(EVENT_STATE_LOAD, {
      state: state.meta.name,
      world: state.meta.template,
    });
  }

  /**
   * Leave the state step loop.
   */
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

    const pendingSave = onceEvent<LoaderReadEvent>(this.event, EVENT_LOADER_DONE);

    this.event.emit(EVENT_LOADER_SAVE, {
      data,
      path,
    });

    const save = await pendingSave;

    this.event.emit(EVENT_STATE_OUTPUT, {
      context: {
        meta: state.meta,
        path: save.path,
      },
      line: 'meta.save.state',
      step: state.step,
      volume: ShowVolume.WORLD,
    });
  }

  /**
   * Perform the next world state step.
   */
  public async doStep(event: ActorCommandEvent): Promise<void> {
    const { actor, command } = event;

    // if there is no world state, there won't be an actor, but this error is more informative
    if (isNil(actor) || isNil(this.state)) {
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

    this.commandBuffer.push(actor, command);
    this.logger.debug({
      actor: actor.meta.id,
      left: this.commandQueue.remaining().map((it) => it.meta.id),
      size: this.commandQueue.size,
      verb: command.verb,
    }, 'pushing command to queue');

    // step world after last actor acts
    if (this.commandQueue.complete(actor)) {
      this.logger.debug({
        actor: actor.meta.id,
        size: this.commandQueue.size,
        verb: command.verb,
      }, 'queue completed on command');
      const step = await this.step();
      this.event.emit(EVENT_STATE_STEP, {
        step,
      });
    }
  }

  public async doWorlds(): Promise<void> {
    for (const world of this.worlds) {
      this.event.emit(EVENT_STATE_OUTPUT, {
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
  // #endregion meta commands

  public async step(): Promise<StepResult> {
    if (isNil(this.state)) {
      throw new NotInitializedError('state has not been initialized');
    }

    const seen = new Set();
    const start = Date.now();

    const scope: SuppliedScope = {
      data: new Map(),
      random: this.random,
      state: {
        enter: (target) => this.stepEnter(target),
        find: (search) => this.stepFind(search),
        move: (target, context) => this.stepMove(target, context),
        quit: () => this.doQuit(),
        show: (msg, context, volume, source) => this.stepShow(msg, context, volume, source),
      },
      transfer: mustExist(this.transfer),
    };

    for (const room of this.state.rooms) {
      if (seen.has(room.meta.id) === false) {
        seen.add(room.meta.id);
        await this.script.invoke(room, SIGNAL_STEP, {
          ...scope,
          room,
        });

        for (const actor of room.actors) {
          if (seen.has(actor.meta.id) === false) {
            seen.add(actor.meta.id);

            const command = await this.getActorCommand(actor);
            await this.script.invoke(actor, SIGNAL_STEP, {
              ...scope,
              actor,
              command,
              room,
            });

            for (const item of actor.items) {
              if (seen.has(item.meta.id) === false) {
                seen.add(item.meta.id);
                await this.script.invoke(item, SIGNAL_STEP, {
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
              await this.script.invoke(item, SIGNAL_STEP, {
                ...scope,
                item,
                room,
              });
            }
          }

          for (const portal of room.portals) {
            if (seen.has(portal.meta.id) === false) {
              seen.add(portal.meta.id);
              await this.script.invoke(portal, SIGNAL_STEP, {
                ...scope,
                portal,
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

    await this.broadcastChanges(this.state.rooms);

    return {
      time: this.state.step.time,
      turn: this.state.step.turn,
    };
  }

  // #region state access callbacks
  /**
   * Handler for a room change from the state helper.
   */
  public async stepEnter(target: StateSource): Promise<void> {
    const generator = mustExist(this.generator);
    const state = mustExist(this.state);

    if (doesExist(target.actor) && target.actor.source === ActorSource.PLAYER) {
      const rooms = await generator.populateRoom(target.room, state.rooms, state.world.depth);
      this.logger.debug({ rooms }, 'adding new rooms');
      if (rooms.length > 0) {
        state.rooms.push(...rooms);
      }
    }

    await this.broadcastChanges(state.rooms);
  }

  public async stepFind<TType extends WorldEntityType>(search: SearchFilter<TType>): Promise<Array<EntityForType<TType>>> {
    return findMatching(mustExist(this.state), search);
  }

  public async stepMove(target: ActorTransfer | ItemTransfer, context: ScriptContext): Promise<void> {
    const transfer = mustExist(this.transfer);

    if (isActorTransfer(target)) {
      return transfer.moveActor(target, context);
    }

    if (isItemTransfer(target)) {
      return transfer.moveItem(target, context);
    }

    throw new ScriptTargetError('cannot move rooms');
  }

  /**
   * Handler for a line of input from the state helper.
   */
  public async stepShow(line: string, context?: LocaleContext, volume: ShowVolume = ShowVolume.WORLD, source?: StateSource): Promise<void> {
    this.event.emit(EVENT_STATE_OUTPUT, {
      line,
      context,
      source,
      step: mustExist(this.state).step,
      volume,
    });
  }
  // #endregion state access callbacks

  /**
   * Emit changed rooms to relevant actors.
   *
   * @todo only emit changed rooms
   * @todo do not double-loop
   */
  protected async broadcastChanges(rooms: Array<Room>): Promise<void> {
    this.logger.debug('queueing actors');
    this.commandQueue.clear();
    for (const room of rooms) {
      for (const actor of room.actors) {
        this.commandQueue.add(actor);
        this.logger.debug({ actor: actor.meta.id, size: this.commandQueue.size }, 'adding actor to queue');
      }
    }

    this.logger.debug('broadcasting room changes');
    for (const room of rooms) {
      for (const actor of room.actors) {
        this.event.emit(EVENT_STATE_ROOM, {
          actor,
          room,
        });
      }
    }
  }

  /**
   * Get the next queued command for an actor.
   */
  protected async getActorCommand(actor: Actor): Promise<Command> {
    const command = this.commandBuffer.pop(actor);

    if (doesExist(command)) {
      return command;
    } else {
      throw new Error('actor has not queued a command: ' + actor.meta.id);
    }
  }
}
