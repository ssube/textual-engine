import { EventEmitter } from 'events';

import { ErrorHandler, EventHandler } from '../../util/async/event';
import { ActorCommandEvent, ActorJoinEvent } from '../actor/events';
import { LoaderConfigEvent, LoaderReadEvent, LoaderSaveEvent, LoaderStateEvent, LoaderWorldEvent } from '../loader/events';
import { LocaleBundleEvent } from '../locale/events';
import { StepResult } from '../state';
import { StateJoinEvent, StateLoadEvent, StateOutputEvent, StateRoomEvent } from '../state/events';

/**
 * Line-driven IO, between actor and render.
 */
export interface LineEvent {
  lines: Array<string>;
}

/**
 * @todo find a better type, probably `Service`, so the bus can reach out to groups and request they stop themselves
 */
export type EventGroup = any;

export interface EventBus extends EventEmitter {
  // global events
  emit(name: 'error', err: Error): boolean;
  emit(name: 'quit'): boolean;

  /**
   * Parsed commands coming from actor service.
   */
  emit(name: 'actor-command', event: ActorCommandEvent): boolean;

  emit(name: 'actor-join', event: ActorJoinEvent): boolean;

  /**
   * Translated output coming from actor service.
   */
  emit(name: 'actor-output', event: LineEvent): boolean;

  emit(name: 'locale-bundle', event: LocaleBundleEvent): boolean;

  emit(name: 'loader-config', event: LoaderConfigEvent): boolean;

  emit(name: 'loader-done', event: LoaderReadEvent): boolean;

  emit(name: 'loader-read', event: LoaderReadEvent): boolean;

  emit(name: 'loader-save', event: LoaderSaveEvent): boolean;

  emit(name: 'loader-state', event: LoaderStateEvent): boolean;

  emit(name: 'loader-world', event: LoaderWorldEvent): boolean;

  /**
   * Unparsed input coming from render service.
   */
  emit(name: 'render-output', event: LineEvent): boolean;

  emit(name: 'state-join', event: StateJoinEvent): boolean;

  emit(name: 'state-load', event: StateLoadEvent): boolean;

  /**
   * Updated room events coming from state service.
   */
  emit(name: 'state-room', event: StateRoomEvent): boolean;

  emit(name: 'state-step', event: StepResult): boolean;

  /**
   * Untranslated output coming from state service.
   */
  emit(name: 'state-output', event: StateOutputEvent): boolean;

  // global events
  on(name: 'error', handler: ErrorHandler, group?: EventGroup): this;
  on(name: 'quit', event: EventHandler<void>, group?: EventGroup): this;

  // service events
  on(name: 'actor-command', handler: EventHandler<ActorCommandEvent>, group?: EventGroup): this;
  on(name: 'actor-join', handler: EventHandler<ActorJoinEvent>, group?: EventGroup): this;
  on(name: 'actor-output', handler: EventHandler<LineEvent>, group?: EventGroup): this;
  on(name: 'locale-bundle', handler: EventHandler<LocaleBundleEvent>, group?: EventGroup): this;
  on(name: 'loader-config', handler: EventHandler<LoaderConfigEvent>, group?: EventGroup): this;
  on(name: 'loader-done', handler: EventHandler<LoaderReadEvent>, group?: EventGroup): this;
  on(name: 'loader-read', handler: EventHandler<LoaderReadEvent>, group?: EventGroup): this;
  on(name: 'loader-save', handler: EventHandler<LoaderSaveEvent>, group?: EventGroup): this;
  on(name: 'loader-state', handler: EventHandler<LoaderStateEvent>, group?: EventGroup): this;
  on(name: 'loader-world', handler: EventHandler<LoaderWorldEvent>, group?: EventGroup): this;
  on(name: 'render-output', handler: EventHandler<LineEvent>, group?: EventGroup): this;
  on(name: 'state-join', handler: EventHandler<StateJoinEvent>, group?: EventGroup): this;
  on(name: 'state-load', handler: EventHandler<StateLoadEvent>, group?: EventGroup): this;
  on(name: 'state-room', handler: EventHandler<StateRoomEvent>, group?: EventGroup): this;
  on(name: 'state-step', handler: EventHandler<StepResult>, group?: EventGroup): this;
  on(name: 'state-output', handler: EventHandler<StateOutputEvent>, group?: EventGroup): this;

  removeGroup(group: EventGroup): void;
}
