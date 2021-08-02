/* eslint-disable @typescript-eslint/unified-signatures */
import { EventEmitter } from 'events';

import { Service } from '../index.js';
import { ErrorHandler, EventHandler } from '../../util/async/event.js';
import { ActorCommandEvent, ActorJoinEvent, ActorOutputEvent, ActorQuitEvent, ActorRoomEvent } from '../actor/events.js';
import { LoaderConfigEvent, LoaderReadEvent, LoaderSaveEvent, LoaderStateEvent, LoaderWorldEvent } from '../loader/events.js';
import { LocaleBundleEvent } from '../locale/events.js';
import { RenderInputEvent } from '../render/events.js';
import {
  StateJoinEvent,
  StateLoadEvent,
  StateOutputEvent,
  StateQuitEvent,
  StateRoomEvent,
  StateStepEvent,
  StateWorldEvent,
} from '../state/events.js';
import { TokenCommandEvent } from '../tokenizer/events.js';

export type EventGroup = Service;

export type AnyHandler = ErrorHandler | EventHandler<void> | EventHandler<unknown>;

export interface EventBus extends EventEmitter {
  // global events
  emit(name: 'error', err: Error): boolean;
  emit(name: 'quit'): boolean;

  emit(name: 'actor-command', event: ActorCommandEvent): boolean;
  emit(name: 'actor-join', event: ActorJoinEvent): boolean;
  emit(name: 'actor-output', event: ActorOutputEvent): boolean;
  emit(name: 'actor-room', event: ActorRoomEvent): boolean;
  emit(name: 'actor-quit', event: ActorQuitEvent): boolean;

  emit(name: 'locale-bundle', event: LocaleBundleEvent): boolean;

  emit(name: 'loader-config', event: LoaderConfigEvent): boolean;
  emit(name: 'loader-done', event: LoaderReadEvent): boolean;
  emit(name: 'loader-read', event: LoaderReadEvent): boolean;
  emit(name: 'loader-save', event: LoaderSaveEvent): boolean;
  emit(name: 'loader-state', event: LoaderStateEvent): boolean;
  emit(name: 'loader-world', event: LoaderWorldEvent): boolean;

  emit(name: 'render-input', event: RenderInputEvent): boolean;

  emit(name: 'state-join', event: StateJoinEvent): boolean;
  emit(name: 'state-load', event: StateLoadEvent): boolean;
  emit(name: 'state-quit', event: StateQuitEvent): boolean;
  emit(name: 'state-room', event: StateRoomEvent): boolean;
  emit(name: 'state-step', event: StateStepEvent): boolean;
  emit(name: 'state-output', event: StateOutputEvent): boolean;
  emit(name: 'state-world', event: StateWorldEvent): boolean;

  emit(name: 'token-command', event: TokenCommandEvent): boolean;

  // global events
  on(name: 'error', handler: ErrorHandler, group?: EventGroup): this;
  on(name: 'quit', event: EventHandler<void>, group?: EventGroup): this;

  // service events
  on(name: 'actor-command', handler: EventHandler<ActorCommandEvent>, group?: EventGroup): this;
  on(name: 'actor-join', handler: EventHandler<ActorJoinEvent>, group?: EventGroup): this;
  on(name: 'actor-output', handler: EventHandler<ActorOutputEvent>, group?: EventGroup): this;
  on(name: 'actor-room', handler: EventHandler<ActorRoomEvent>, group?: EventGroup): this;
  on(name: 'actor-quit', handler: EventHandler<ActorQuitEvent>, group?: EventGroup): this;

  on(name: 'locale-bundle', handler: EventHandler<LocaleBundleEvent>, group?: EventGroup): this;

  on(name: 'loader-config', handler: EventHandler<LoaderConfigEvent>, group?: EventGroup): this;
  on(name: 'loader-done', handler: EventHandler<LoaderReadEvent>, group?: EventGroup): this;
  on(name: 'loader-read', handler: EventHandler<LoaderReadEvent>, group?: EventGroup): this;
  on(name: 'loader-save', handler: EventHandler<LoaderSaveEvent>, group?: EventGroup): this;
  on(name: 'loader-state', handler: EventHandler<LoaderStateEvent>, group?: EventGroup): this;
  on(name: 'loader-world', handler: EventHandler<LoaderWorldEvent>, group?: EventGroup): this;

  on(name: 'render-input', handler: EventHandler<RenderInputEvent>, group?: EventGroup): this;

  on(name: 'state-join', handler: EventHandler<StateJoinEvent>, group?: EventGroup): this;
  on(name: 'state-load', handler: EventHandler<StateLoadEvent>, group?: EventGroup): this;
  on(name: 'state-quit', handler: EventHandler<StateQuitEvent>, group?: EventGroup): this;
  on(name: 'state-room', handler: EventHandler<StateRoomEvent>, group?: EventGroup): this;
  on(name: 'state-step', handler: EventHandler<StateStepEvent>, group?: EventGroup): this;
  on(name: 'state-output', handler: EventHandler<StateOutputEvent>, group?: EventGroup): this;
  on(name: 'state-world', handler: EventHandler<StateWorldEvent>, group?: EventGroup): this;

  on(name: 'token-command', handler: EventHandler<TokenCommandEvent>, group?: EventGroup): this;

  removeGroup(group: EventGroup): void;
}
