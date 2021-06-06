import { Command } from '../../model/Command';
import { Actor } from '../../model/entity/Actor';
import { Room } from '../../model/entity/Room';
import { StepResult } from '../state';

export interface ActorCommandEvent {
  command: Command;
  actor?: Actor;
  room?: Room;
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

export interface ActorRoomEvent {
  room: Room;
}
