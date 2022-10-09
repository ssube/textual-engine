import { NotImplementedError } from '@apextoaster/js-utils';
import { EventEmitter } from 'events';
import { CursorPos, Key, ReadLine } from 'readline';
import { SinonStubbedInstance } from 'sinon';

import { createStubInstance } from '../../helper.js';

export enum PromptState {
  START = 'start',
  PROMPT = 'prompt',
  CLOSED = 'closed',
}

export class TestReadLine extends EventEmitter implements ReadLine {
  public static createStub(): SinonStubbedInstance<TestReadLine> {
    return createStubInstance(TestReadLine);
  }

  protected promptLine: string;
  protected state: PromptState;
  protected writeLine: string;

  constructor() {
    super();

    this.promptLine = '';
    this.state = PromptState.START;
    this.writeLine = '';
  }

  public get terminal(): boolean {
    return false;
  }

  public get line(): string {
    return this.writeLine;
  }

  public get cursor(): number {
    return 0;
  }

  public emit(event: string, ...args: any): boolean {
    if (event === 'line') {
      this.state = PromptState.START;
    }

    return super.emit(event, ...args);
  }

  public getPrompt(): string {
    return this.promptLine;
  }

  public setPrompt(prompt: string): void {
    this.promptLine = prompt;
  }

  public prompt(preserveCursor?: boolean): void {
    this.state = PromptState.PROMPT;
  }

  public question(query: string, callback: (answer: string) => void): void;
  public question(query: string, options: EventEmitter.Abortable, callback: (answer: string) => void): void;
  public question(query: any, options: any, callback?: any) {
    throw new NotImplementedError();
  }

  public pause(): this {
    throw new NotImplementedError();
  }

  public resume(): this {
    throw new NotImplementedError();
  }

  public close(): void {
    this.state = PromptState.CLOSED;
  }

  public write(data: string | Buffer, key?: Key): void {
    if (typeof data === 'string') {
      this.writeLine = data;
    } else {
      this.writeLine = data.toString('utf-8');
    }

    this.emit('line', this.writeLine);
  }

  public getCursorPos(): CursorPos {
    throw new NotImplementedError();
  }

  public [Symbol.asyncIterator](): AsyncIterableIterator<string> {
    throw new NotImplementedError();
  }
}
