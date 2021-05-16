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
    return new Promise((res, rej) => {
      this.emits.once('error', (err: Error) => {
        this.emits.removeAllListeners('line');
        rej(err);
      });
      this.emits.once('line', (line: string) => {
        this.emits.removeAllListeners('error');
        res(line);
      });
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
      onLine: (line: string) => {
        return new Promise<InkState>((res, rej) => {
          this.emits.once('error', (err: Error) => {
            rej(err);
          });
          this.emits.once('step', (state: InkState) => {
            res(state);
          });
          this.emits.emit('line', line);
        });
      },
      onQuit: () => {
        return new Promise<void>((res, rej) => {
          this.emits.once('error', (err: Error) => {
            rej(err);
          });
          this.emits.once('quit', () => {
            res();
          });
        });
      },
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
}