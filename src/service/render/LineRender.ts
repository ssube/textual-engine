import { doesExist, mustExist } from '@apextoaster/js-utils';
import { Inject } from 'noicejs';
import { stdin, stdout } from 'process';
import { createInterface, Interface as LineInterface } from 'readline';

import { Render } from '.';
import { BaseRender, BaseRenderOptions } from './BaseRender';


@Inject(/* all from base */)
export class LineRender extends BaseRender implements Render {
  protected reader?: LineInterface;

  constructor(options: BaseRenderOptions) {
    super(options);
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

  prompt(prompt: string): void {
    mustExist(this.reader).setPrompt(prompt);
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

  async start() {
    this.reader = createInterface({
      input: stdin,
      output: stdout,
      prompt: '> ',
    });

    this.running = true;
  }

  async stop() {
    this.running = false;

    if (doesExist(this.reader)) {
      this.reader.close();
    }
  }

  loopStep(output: Array<string>) {
    // noop
  }
}