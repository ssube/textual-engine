import { Command } from '../../model/Command.js';
import { ReadonlyActor } from '../../model/entity/Actor.js';
import { ReadonlyRoom } from '../../model/entity/Room.js';
import { StepResult } from '../state/index.js';

export interface ActorCommandEvent {
  command: Command;
  actor?: ReadonlyActor;
  room?: ReadonlyRoom;
}

export interface ActorJoinEvent {
  pid: string;
}

export interface ActorOutputEvent {
  /**
   * Untranslated output, often a locale key.
   */
  line: string;

  /**
   * The state step from which this output was emitted.
   */
  step: StepResult;
}

export interface ActorQuitEvent {
  line: string;

  stats: Array<{
    name: string;
    value: number;
  }>;
}

export interface ActorRoomEvent {
  actor: ReadonlyActor;
  pid: string;
  room: ReadonlyRoom;
}
