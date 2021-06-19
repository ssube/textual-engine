/* eslint-disable @typescript-eslint/unified-signatures */
import { EventEmitter } from 'events';
import { Service } from '..';

import { ErrorHandler, EventHandler } from '../../util/async/event';
import { ActorCommandEvent, ActorJoinEvent, ActorOutputEvent, ActorRoomEvent } from '../actor/events';
import { LoaderConfigEvent, LoaderReadEvent, LoaderSaveEvent, LoaderStateEvent, LoaderWorldEvent } from '../loader/events';
import { LocaleBundleEvent } from '../locale/events';
import { RenderOutputEvent } from '../render/events';
import { StateJoinEvent, StateLoadEvent, StateOutputEvent, StateRoomEvent, StateStepEvent } from '../state/events';

export type EventGroup = Service;

export type AnyHandler = ErrorHandler | EventHandler<void> | EventHandler<unknown>;

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
  emit(name: 'actor-output', event: ActorOutputEvent): boolean;

  emit(name: 'actor-room', event: ActorRoomEvent): boolean;

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
  emit(name: 'render-output', event: RenderOutputEvent): boolean;

  emit(name: 'state-join', event: StateJoinEvent): boolean;

  emit(name: 'state-load', event: StateLoadEvent): boolean;

  /**
   * Updated room events coming from state service.
   */
  emit(name: 'state-room', event: StateRoomEvent): boolean;

  emit(name: 'state-step', event: StateStepEvent): boolean;

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
  on(name: 'actor-output', handler: EventHandler<ActorOutputEvent>, group?: EventGroup): this;
  on(name: 'actor-room', handler: EventHandler<ActorRoomEvent>, group?: EventGroup): this;
  on(name: 'locale-bundle', handler: EventHandler<LocaleBundleEvent>, group?: EventGroup): this;
  on(name: 'loader-config', handler: EventHandler<LoaderConfigEvent>, group?: EventGroup): this;
  on(name: 'loader-done', handler: EventHandler<LoaderReadEvent>, group?: EventGroup): this;
  on(name: 'loader-read', handler: EventHandler<LoaderReadEvent>, group?: EventGroup): this;
  on(name: 'loader-save', handler: EventHandler<LoaderSaveEvent>, group?: EventGroup): this;
  on(name: 'loader-state', handler: EventHandler<LoaderStateEvent>, group?: EventGroup): this;
  on(name: 'loader-world', handler: EventHandler<LoaderWorldEvent>, group?: EventGroup): this;
  on(name: 'render-output', handler: EventHandler<RenderOutputEvent>, group?: EventGroup): this;
  on(name: 'state-join', handler: EventHandler<StateJoinEvent>, group?: EventGroup): this;
  on(name: 'state-load', handler: EventHandler<StateLoadEvent>, group?: EventGroup): this;
  on(name: 'state-room', handler: EventHandler<StateRoomEvent>, group?: EventGroup): this;
  on(name: 'state-step', handler: EventHandler<StateStepEvent>, group?: EventGroup): this;
  on(name: 'state-output', handler: EventHandler<StateOutputEvent>, group?: EventGroup): this;

  removeGroup(group: EventGroup): void;
}
