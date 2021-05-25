import { EventEmitter } from 'events';

import { Command } from '../../model/Command';
import { Actor } from '../../model/entity/Actor';
import { Room } from '../../model/entity/Room';
import { ErrorHandler, EventHandler } from '../../util/event';
import { StepResult } from '../state';

export interface InputEvent {
  lines: Array<string>;
}

export interface RoomEvent {
  room: Room;
}

export interface OutputEvent {
  lines: Array<string>;
  step: StepResult;
}

export interface CommandEvent {
  // actor: Actor;
  command: Command;
}

export interface EventBus extends EventEmitter {
  emit(name: 'error', err: Error): boolean;
  emit(name: 'quit'): boolean;
  emit(name: 'step', step: StepResult): boolean;

  /**
   * Parsed commands coming from actor service.
   */
  emit(name: 'actor-command', event: CommandEvent): boolean;

  /**
   * Translated output coming from actor service.
   */
  emit(name: 'actor-output', event: OutputEvent): boolean;

  /**
   * Unparsed input coming from render service.
   */
  emit(name: 'render-output', event: InputEvent): boolean;

  /**
   * Updated room events coming from state service.
   */
  emit(name: 'state-room', event: RoomEvent): boolean;

  /**
   * Untranslated output coming from state service.
   */
  emit(name: 'state-output', event: OutputEvent): boolean;

  on(name: 'actor-command', handler: EventHandler<CommandEvent>): this;
  on(name: 'actor-output', handler: EventHandler<OutputEvent>): this;
  on(name: 'render-output', handler: EventHandler<InputEvent>): this;
  on(name: 'state-room', event: EventHandler<RoomEvent>): this;
  on(name: 'state-output', event: EventHandler<OutputEvent>): this;

  // unqualified
  on(name: 'error', handler: ErrorHandler): this;
  on(name: 'quit', event: EventHandler<void>): this;
  on(name: 'step', event: EventHandler<StepResult>): this;
}

