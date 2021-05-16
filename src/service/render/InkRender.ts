import { EventEmitter } from 'events';
import { render, useApp } from 'ink';
import * as React from 'react';

import { Render } from '.';
import { Foo } from './component/ink/Foo';

export interface InkState {
  input: string;
  prompt: string;
  output: Array<string>;
}

/**
 * Interface with Ink's React tree using an event emitter.
 * Is that the right way to do it? Who knows? Not me. :D
 */
export class InkRender implements Render {
  protected emits: EventEmitter;
  protected state: InkState;

  constructor() {
    this.emits = new EventEmitter();
    this.state = {
      input: '',
      prompt: '> ',
      output: [],
    };
  }

  prompt(prompt: string): void {
    this.state.prompt = prompt;
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

  async start(prompt: string): Promise<void> {
    const root = React.createElement(Foo, {
      ...this.state,
      emits: this.emits,
    });
    render(root);
  }

  /**
   * @todo should this call exit? can it?
   */
  async stop(): Promise<void> {
    const { exit } = useApp();
    exit();
  }

  stream(): AsyncIterableIterator<string> {
    const iter = {
      next: async () => {
        try {
          const line = await this.read();
          return { done: false, value: line };
        } catch (err) {
          return { done: true, value: err.msg };
        }
      },
      [Symbol.asyncIterator]: () => {
        return iter;
      },
    };
    return iter;
  }
}