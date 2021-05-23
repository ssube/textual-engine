import { constructorName, InvalidArgumentError, isNil, mustExist, NotFoundError } from '@apextoaster/js-utils';
import { EventEmitter } from 'events';
import { BaseOptions, Container, Inject, Logger } from 'noicejs';

import { CreateParams, StateService, StepResult } from '.';
import { Actor, ACTOR_TYPE, ActorType, isActor } from '../../model/entity/Actor';
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
} from '../../util/constants';
import { Counter } from '../../util/counter';
import { debugState, graphState } from '../../util/debug';
import { onceWithRemove } from '../../util/event';
import { searchState } from '../../util/state';
import { StateEntityGenerator } from '../../util/state/EntityGenerator';
import { StateEntityTransfer } from '../../util/state/EntityTransfer';
import { StateFocusResolver } from '../../util/state/FocusResolver';
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
  protected generator?: StateEntityGenerator;
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
      meta: {
        desc: '',
        id: '',
        name: '',
        template: '',
      },
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

    // load the world locale
    this.locale.deleteBundle('world');
    this.locale.addBundle('world', world.locale);

    // save state for later
    this.state = state;
    this.world = world;

    // prep helpers
    await this.createHelpers();

    // assign metadata
    const generator = mustExist(this.generator);
    state.meta = await generator.createMetadata(world.meta, 'world');

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
    state.rooms.push(startRoom);

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
    state.start.room = startRoom.meta.id;
    state.start.actor = startActor.meta.id;

    // cache verbs
    const input = await this.getActorInput(startActor);
    await input.translate(KNOWN_VERBS);

    return state;
  }

  /**
   * Load an existing world state.
   */
  public async load(state: State): Promise<void> {
    this.state = state;
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
   * Save the current world state.
   */
  public async save(): Promise<State> {
    if (isNil(this.state)) {
      throw new Error('state has not been initialized');
    }

    return this.state;
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
      throw new InvalidArgumentError('invalid focus actor');
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
      case META_GRAPH:
        await this.doGraph(cmd.target);
        break;
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

  public async doGraph(path: string): Promise<void> {
    const state = await this.save();
    const output = graphState(state);
    await this.loader.saveStr(path, output.join('\n'));
    this.emit('output', [
      this.locale.translate('debug.graph.summary', {
        path,
        size: state.rooms.length,
      }),
    ]);
  }

  public async doLoad(path: string, index: number): Promise<void> {
    const dataStr = await this.loader.loadStr(path);
    const data = this.parser.load(dataStr);

    const state = data.states[index];
    this.state = state;
    this.world = data.worlds.find((it) => it.meta.id === state.meta.template);

    await this.createHelpers();

    this.emit('output', [
      `loaded world ${state.meta.id} state from ${path}`,
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

  /**
   * @todo get rid of this in favor of something that does not call DI during state steps
   */
  protected getActorInput(actor: Actor): Promise<Input> {
    return this.container.create<Input, ActorInputOptions>(INJECT_INPUT_ACTOR, {
      id: actor.meta.id,
      type: actor.actorType,
    });
  }

  protected async createHelpers(): Promise<void> {
    const state = mustExist(this.state);
    const world = mustExist(this.world);

    // register focus
    this.focus = await this.container.create(StateFocusResolver, {
      events: {
        onActor: () => Promise.resolve(),
        onRoom: async (room) => {
          const rooms = await mustExist(this.generator).populateRoom(room, state.world.depth);
          state.rooms.push(...rooms);
        },
        onShow: async (line, context) => { // TODO: move to method
          const out = this.locale.translate(line, context);
          this.logger.debug({ line, out }, 'translated output');
          this.onOutput(out);
        },
      },
      state,
    });

    this.generator = await this.container.create(StateEntityGenerator, {
      world,
    });

    this.transfer = await this.container.create(StateEntityTransfer, {
      state,
    });

    // reseed the prng
    this.random.reseed(state.world.seed); // TODO: fast-forward to last state
  }
}
