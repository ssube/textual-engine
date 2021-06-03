import { StepResult } from '.';
import { Actor } from '../../model/entity/Actor';
import { Room } from '../../model/entity/Room';
import { StateSource, ShowVolume } from '../../util/actor';
import { LocaleContext } from '../locale';

export interface StateJoinEvent {
  actor: Actor;
  pid: string;
}

export interface StateRoomEvent {
  actor: Actor;
  room: Room;
}

export interface StateLoadEvent {
  state: string;
  world: string;
}

export interface StateOutputEvent {
  /**
   * Translation context, optional.
   */
  context?: LocaleContext;

  /**
   * Untranslated output, often a locale key.
   */
  line: string;

  /**
   * Message source.
   */
  source?: StateSource;

  /**
   * The state step from which this output was emitted.
   */
  step: StepResult;

  volume: ShowVolume;
}
