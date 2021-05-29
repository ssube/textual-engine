import { EventEmitter } from 'events';

import { Command } from '../../model/Command';
import { Actor } from '../../model/entity/Actor';
import { Room } from '../../model/entity/Room';
import { LocaleBundle } from '../../model/file/Locale';
import { ErrorHandler, EventHandler } from '../../util/event';
import { LoaderConfigEvent, LoaderPathEvent, LoaderStateEvent, LoaderWorldEvent } from '../loader';
import { LocaleContext } from '../locale';
import { StepResult } from '../state';

/**
 * Line-driven IO, between actor and render.
 */
export interface LineEvent {
  lines: Array<string>;
}

export interface RoomEvent {
  actor: Actor;
  room: Room;
}

export interface OutputEvent {
  /**
   * The lines of output.
   */
  lines: Array<{
    context?: LocaleContext;
    key: string;
  }>;

  /**
   * The state step from which this output was emitted.
   */
  step: StepResult;
}

export interface CommandEvent {
  // actor: Actor;
  command: Command;
}

export interface LocaleEvent {
  bundle: LocaleBundle;
  name: string;
}

export interface EventBus extends EventEmitter {
  // global events
  emit(name: 'error', err: Error): boolean;
  emit(name: 'quit'): boolean;

  /**
   * Parsed commands coming from actor service.
   */
  emit(name: 'actor-command', event: CommandEvent): boolean;

  /**
   * Translated output coming from actor service.
   */
  emit(name: 'actor-output', event: LineEvent): boolean;

  emit(name: 'locale-bundle', event: LocaleEvent): boolean;

  emit(name: 'loader-path', event: LoaderPathEvent): boolean;

  emit(name: 'loader-config', event: LoaderConfigEvent): boolean;

  emit(name: 'loader-state', event: LoaderStateEvent): boolean;

  emit(name: 'loader-world', event: LoaderWorldEvent): boolean;

  /**
   * Unparsed input coming from render service.
   */
  emit(name: 'render-output', event: LineEvent): boolean;

  /**
   * Updated room events coming from state service.
   */
  emit(name: 'state-room', event: RoomEvent): boolean;

  emit(name: 'state-step', event: StepResult): boolean;

  /**
   * Untranslated output coming from state service.
   */
  emit(name: 'state-output', event: OutputEvent): boolean;

  // global events
  on(name: 'error', handler: ErrorHandler): this;
  on(name: 'quit', event: EventHandler<void>): this;

  // service events
  on(name: 'actor-command', handler: EventHandler<CommandEvent>): this;
  on(name: 'actor-output', handler: EventHandler<LineEvent>): this;
  on(name: 'locale-bundle', handler: EventHandler<LocaleEvent>): this;
  on(name: 'loader-path', handler: EventHandler<LoaderPathEvent>): this;
  on(name: 'loader-config', handler: EventHandler<LoaderConfigEvent>): this;
  on(name: 'loader-state', handler: EventHandler<LoaderStateEvent>): this;
  on(name: 'loader-world', handler: EventHandler<LoaderWorldEvent>): this;
  on(name: 'render-output', handler: EventHandler<LineEvent>): this;
  on(name: 'state-room', handler: EventHandler<RoomEvent>): this;
  on(name: 'state-step', handler: EventHandler<StepResult>): this;
  on(name: 'state-output', handler: EventHandler<OutputEvent>): this;
}
