import { EventEmitter } from 'events';

import { Service } from '..';
import { Command } from '../../model/Command';
import { Actor } from '../../model/entity/Actor';
import { Room } from '../../model/entity/Room';
import { ErrorHandler, EventHandler } from '../../util/types';
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
  actor: Actor;
  command: Command;
}

export interface ActorService extends EventEmitter, Service {
  last(): Promise<Command>;

  /**
   * @todo remove, do in start
   */
  translate(verbs: ReadonlyArray<string>): Promise<void>;

  emit(name: 'input', event: InputEvent): boolean;
  emit(name: 'room', event: RoomEvent): boolean;
  emit(name: 'output', event: OutputEvent): boolean;

  on(name: 'command', handler: EventHandler<CommandEvent>): this;
  on(name: 'error', handler: ErrorHandler): this;
  on(name: 'output', handler: EventHandler<OutputEvent>): this;
  on(name: 'quit', handler: EventHandler<void>): this;
  on(name: 'room', handler: EventHandler<RoomEvent>): this;
}
