import { doesExist } from '@apextoaster/js-utils';
import { EventEmitter } from 'events';
import { render } from 'ink';
import * as React from 'react';

import { Render } from '.';
import { BaseRender, BaseRenderOptions } from './BaseRender';
import { Frame } from './component/ink/Frame';

export interface InkState {
  input: string;
  prompt: string;
  output: Array<string>;
}

export type InkStateDispatch = (input: string) => Promise<InkState>;
export type InkQuitDispatch = () => Promise<void>;

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

    return new Promise((res, rej) => {
      const error = (err: Error) => {
        this.emits.removeListener('line', line);
        rej(err);
      };

      const line = (line: string) => {
        this.emits.removeListener('error', error);
        res(line);
      };

      this.emits.once('error', error);
      this.emits.once('line', line);
    });
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

  onLine(line: string): Promise<InkState> {
    return new Promise<InkState>((res, rej) => {
      const error = (err: Error) => {
        this.emits.removeListener('step', step);
        rej(err);
      };

      const step = (state: InkState) => {
        this.emits.removeListener('error', error);
        res(state);
      };

      this.emits.once('error', error);
      this.emits.once('step', step);
      this.emits.emit('line', line);
    });
  }

  onQuit(): Promise<void> {
    return new Promise<void>((res, rej) => {
      const error = (err: Error) => {
        this.emits.removeListener('quit', quit);
        rej(err);
      };

      const quit = () => {
        this.emits.removeListener('error', error);
        res();
      };

      this.emits.once('error', error);
      this.emits.once('quit', quit);
    });
  }
}