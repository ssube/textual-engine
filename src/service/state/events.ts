import { StepResult } from '.';
import { ReadonlyActor } from '../../model/entity/Actor';
import { ReadonlyRoom } from '../../model/entity/Room';
import { ShowVolume, StateSource } from '../../util/actor';
import { LocaleContext } from '../locale';

export interface StateJoinEvent {
  actor: ReadonlyActor;
  pid: string;
  room: ReadonlyRoom;
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

export interface StateRoomEvent {
  actor: ReadonlyActor;
  room: ReadonlyRoom;
}

export interface StateStepEvent {
  step: StepResult;
}
