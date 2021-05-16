import { doesExist } from '@apextoaster/js-utils';
import { EventEmitter } from 'events';
import { render } from 'ink';
import * as React from 'react';

import { Render } from '.';
import { onceWithRemove, RemoveResult } from '../../util/event';
import { BaseRender, BaseRenderOptions } from './BaseRender';
import { Frame } from './component/ink/Frame';

export interface InkState {
  input: string;
  prompt: string;
  output: Array<string>;
}

export type InkStateDispatch = (input: string) => RemoveResult<InkState>;
export type InkQuitDispatch = () => RemoveResult<void>;

/**
 * Interface with Ink's React tree using an event emitter.
 * Is that the right way to do it? Who knows? Not me. :D
 */
export class InkRender extends BaseRender implements Render {
  protected emits: EventEmitter;
  protected output: Array<string>;
  protected promptStr: string;

  constructor(options: BaseRenderOptions) {
    super(options);

    this.emits = new EventEmitter();
    this.output = [];
    this.promptStr = '';
  }

  prompt(prompt: string): void {
    this.promptStr = prompt;
  }

  read(prompt?: string): Promise<string> {
    if (doesExist(prompt)) {
      this.promptStr = prompt;
    }

    const { pending } = onceWithRemove<string>(this.emits, 'line');

    return pending;
  }

  async show(msg: string): Promise<void> {
    this.output.push(msg);
  }

  showSync(msg: string): void {
    this.output.push(msg);
  }

  async start(): Promise<void> {
    const root = React.createElement(Frame, {
      onLine: (line: string) => this.onLine(line),
      onQuit: () => this.onQuit(),
    });

    render(root);

    this.running = true;
  }

  async stop(): Promise<void> {
    this.emits.emit('quit');
  }

  loopStep(output: Array<string>) {
    const state: InkState = {
      input: '',
      prompt: this.promptStr,
      output,
    };
    this.emits.emit('step', state);
  }

  onLine(line: string): RemoveResult<InkState> {
    return onceWithRemove(this.emits, 'step', () => {
      this.emits.emit('line', line);
    });
  }

  onQuit(): RemoveResult<void> {
    return onceWithRemove(this.emits, 'quit');
  }
}