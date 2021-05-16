import { EventEmitter } from 'events';
import { render } from 'ink';
import * as React from 'react';

import { Render } from '.';
import { Foo } from './component/ink/Foo';

export interface InkState {
  input: string;
  output: Array<string>;
}

export type InkStateDispatch = (input: string) => Promise<InkState>;

/**
 * Interface with Ink's React tree using an event emitter.
 * Is that the right way to do it? Who knows? Not me. :D
 */
export class InkRender implements Render {
  protected emits: EventEmitter;
  protected promptStr: string;
  protected running: boolean;
  protected state: InkState;

  constructor() {
    this.emits = new EventEmitter();
    this.promptStr = '';
    this.running = false;
    this.state = {
      input: '',
      output: [],
    };
  }

  prompt(prompt: string): void {
    this.promptStr = prompt;
  }

  read(prompt?: string): Promise<string> {
    return new Promise((res, rej) => {
      this.emits.once('error', (err: Error) => {
        rej(err);
      });
      this.emits.once('line', (line: string) => {
        res(line);
      });
    });
  }

  async show(msg: string): Promise<void> {
    this.state.output.push(msg);
  }

  showSync(msg: string): void {
    this.state.output.push(msg);
  }

  async start(): Promise<void> {
    const root = React.createElement(Foo, {
      ...this.state,
      emits: this.emits,
    });

    render(root);
  }

  async stop(): Promise<void> {
    // noop
  }

  async loop(prompt: string): Promise<void> {
    while (this.running) {
      const line = await this.read();

    }
  }
}