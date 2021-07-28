import { StepResult } from './index.js';
import { ReadonlyActor } from '../../model/entity/Actor.js';
import { ReadonlyRoom } from '../../model/entity/Room.js';
import { TemplateMetadata } from '../../model/mapped/Template.js';
import { ShowVolume, StateSource } from '../../util/actor/index.js';
import { LocaleContext } from '../locale/index.js';

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

export interface StateQuitEvent {
  /**
   * Translation context, optional.
   */
  context?: LocaleContext;

  /**
   * Untranslated output, often a locale key.
   */
  line: string;

  /**
   * Which player is quitting. If not specified, all.
   */
  pid?: string;

  stats: Array<string>;
}

export interface StateRoomEvent {
  actor: ReadonlyActor;
  room: ReadonlyRoom;
}

export interface StateStepEvent {
  step: StepResult;
}

export interface StateWorldEvent {
  worlds: Array<TemplateMetadata>;
}
