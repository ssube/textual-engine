import { doesExist, mustExist } from '@apextoaster/js-utils';
import { EventEmitter } from 'events';
import { stdin, stdout } from 'process';
import { createInterface, Interface as LineInterface } from 'readline';

import { Render } from '.';

export class LineRender extends EventEmitter implements Render {
  protected closed: boolean;
  protected reader?: LineInterface;

  constructor() {
    super();

    this.closed = false;
  }

  async read(): Promise<string> {
    const reader = mustExist(this.reader);

    const result = new Promise<string>((res, rej) => {
      reader.once('SIGINT', () => {
        reader.removeAllListeners();
        res('quit');
      });

      reader.once('line', (line: string) => {
        reader.removeAllListeners();
        res(line);
      });
    });

    reader.prompt();

    return result;
  }

  promptSync(prompt: string): void {
    const reader = mustExist(this.reader);

    reader.setPrompt(prompt);
    reader.prompt();
  }

  async show(msg: string): Promise<void> {
    const reader = mustExist(this.reader);

    reader.write(msg);
    reader.write('\n');
  }

  showSync(msg: string): void {
    process.stdout.write(msg);
    process.stdout.write('\n');
  }

  async start(prompt: string) {
    this.reader = createInterface({
      input: stdin,
      output: stdout,
      prompt: '> ',
    });

    this.reader.setPrompt(prompt);
  }

  async stop() {
    this.closed = true;

    if (doesExist(this.reader)) {
      this.reader.close();
    }
  }

  stream(): AsyncIterableIterator<string> {
    const iter = {
      next: async () => {
        if (this.closed) {
          return { done: true, value: '' };
        } else {
          try {
            const line = await this.read();
            return { done: false, value: line };
          } catch (err) {
            return { done: true, value: err.msg };
          }
        }
      },
      [Symbol.asyncIterator]: () => {
        return iter;
      },
    };
    return iter;
  }
}