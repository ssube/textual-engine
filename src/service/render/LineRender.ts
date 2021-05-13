import { stdin, stdout } from 'process';
import { createInterface, Interface as LineInterface } from 'readline';

import { Render } from '.';

export class LineRender implements Render {
  protected reader: LineInterface;

  constructor() {
    this.reader = createInterface({
      input: stdin,
      output: stdout,
      prompt: '> ',
    });
  }

  async read(prompt: string): Promise<string> {
    const result = new Promise<string>((res, rej) => {
      this.reader.once('SIGINT', () => {
        rej();
      });

      this.reader.once('line', (line: string) => {
        res(line);
      });
    });

    this.reader.setPrompt(prompt);
    this.reader.prompt();

    return result;
  }

  async show(msg: string): Promise<void> {
    this.reader.write(msg);
  }

  async stop() {
    this.reader.close();
  }
}