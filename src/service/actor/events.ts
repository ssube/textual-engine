import { Command } from '../../model/Command';
import { ReadonlyActor } from '../../model/entity/Actor';
import { ReadonlyRoom } from '../../model/entity/Room';
import { StepResult } from '../state';

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
