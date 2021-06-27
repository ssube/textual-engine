import { mustExist, NotImplementedError } from '@apextoaster/js-utils';
import { Inject, Logger } from 'noicejs';

import { ActorService } from '.';
import { Command } from '../../model/Command';
import { Actor, ActorSource } from '../../model/entity/Actor';
import { Room } from '../../model/entity/Room';
import { INJECT_EVENT, INJECT_LOGGER, INJECT_RANDOM, INJECT_SCRIPT, InjectedOptions } from '../../module';
import { catchAndLog } from '../../util/async/event';
import { EVENT_ACTOR_COMMAND, EVENT_STATE_ROOM } from '../../util/constants';
import { makeServiceLogger } from '../../util/service';
import { EventBus } from '../event';
import { RandomService } from '../random';
import { ScriptService } from '../script';
import { StateRoomEvent } from '../state/events';

/**
 * Behavioral input generates commands based on the actor's current
 * state (room, inventory, etc).
 */
@Inject(INJECT_EVENT, INJECT_LOGGER, INJECT_RANDOM, INJECT_SCRIPT)
export class ScriptActorService implements ActorService {
  protected event: EventBus;
  protected logger: Logger;
  protected random: RandomService;
  protected script: ScriptService;

  constructor(options: InjectedOptions) {
    this.event = mustExist(options[INJECT_EVENT]);
    this.logger = makeServiceLogger(options[INJECT_LOGGER], this);
    this.random = mustExist(options[INJECT_RANDOM]);
    this.script = mustExist(options[INJECT_SCRIPT]);
  }

  public async start(): Promise<void> {
    this.event.on(EVENT_STATE_ROOM, (event) => {
      if (event.actor.source === ActorSource.BEHAVIOR) {
        catchAndLog(this.onRoom(event), this.logger, 'error during room event');
      }
    }, this);
  }

  public async stop(): Promise<void> {
    this.event.removeGroup(this);
  }

  public async last(): Promise<Command> {
    throw new NotImplementedError();
  }

  public async onRoom(event: StateRoomEvent): Promise<void> {
    return this.script.invoke(event.actor, 'signal.behavior', {
      actor: event.actor,
      behavior: {
        depth: () => Promise.resolve(0), // TODO: implement
        queue: (actor, command) => this.queue(event.room, actor, command),
        ready: () => Promise.resolve(true), // TODO: implement
      },
      data: new Map(),
      random: this.random,
      room: event.room,
      state: {
        create: () => { throw new NotImplementedError('behavior scripts cannot create entities'); },
        enter: () => { throw new NotImplementedError('behavior scripts cannot enter rooms'); },
        find: () => { throw new NotImplementedError('behavior scripts actually can find things'); },
        move: () => { throw new NotImplementedError('behavior scripts cannot move entities'); },
        show: () => { throw new NotImplementedError('behavior scripts cannot show messages'); },
        quit: () => { throw new NotImplementedError('behavior scripts cannot quit the game'); },
        update: () => { throw new NotImplementedError('behavior scripts cannot update entities'); },
      },
      source: event,
      transfer: {
        moveActor: () => { throw new NotImplementedError('behavior scripts cannot move actors'); },
        moveItem: () => { throw new NotImplementedError('behavior scripts cannot move items'); },
      } as any,
    });
  }

  protected async queue(room: Room, actor: Actor, command: Command): Promise<void> {
    this.event.emit(EVENT_ACTOR_COMMAND, {
      actor,
      command,
      room,
    });
  }
}
