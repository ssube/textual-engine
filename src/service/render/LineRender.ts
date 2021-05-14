import { EventEmitter } from 'events';
import { stdin, stdout } from 'process';
import { createInterface, Interface as LineInterface } from 'readline';

import { Render } from '.';

export class LineRender extends EventEmitter implements Render {
  protected closed: boolean;
  protected reader: LineInterface;

  constructor() {
    super();

    this.closed = false;
    this.reader = createInterface({
      input: stdin,
      output: stdout,
      prompt: '> ',
    });
  }

  async read(prompt: string): Promise<string> {
    const result = new Promise<string>((res, rej) => {
      this.reader.once('SIGINT', () => {
        this.reader.removeAllListeners();
        res('quit');
      });

      this.reader.once('line', (line: string) => {
        this.reader.removeAllListeners();
        res(line);
      });
    });

    this.promptSync(prompt);

    return result;
  }

  promptSync(prompt: string): void {
    this.reader.setPrompt(prompt);
    this.reader.prompt();
  }

  async show(msg: string): Promise<void> {
    this.reader.write(msg);
    this.reader.write('\n');
  }

  showSync(msg: string): void {
    process.stdout.write(msg);
    process.stdout.write('\n');
  }

  async stop() {
    this.closed = true;
    this.reader.close();
  }

  stream(): AsyncIterableIterator<string> {
    const iter = {
      next: async () => {
        if (this.closed) {
          return {done: true, value: ''};
        } else {
          try {
            const line = await this.read(' - ');
            return {done: false, value: line};
          } catch (err) {
            return {done: true, value: err.msg};
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