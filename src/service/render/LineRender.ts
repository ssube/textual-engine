import { doesExist, mustExist } from '@apextoaster/js-utils';
import { EventEmitter } from 'events';
import { BaseOptions, Inject, Logger } from 'noicejs';
import { stdin, stdout } from 'process';
import { createInterface, Interface as LineInterface } from 'readline';

import { Render } from '.';
import { INJECT_INPUT_PLAYER, INJECT_LOADER, INJECT_LOGGER, INJECT_STATE } from '../../module';
import { KNOWN_VERBS } from '../../util/constants';
import { debugState, graphState } from '../../util/debug';
import { Input } from '../input';
import { Loader } from '../loader';
import { StateController } from '../state';

export interface LineRenderOptions extends BaseOptions {
  [INJECT_INPUT_PLAYER]?: Input;
  [INJECT_LOADER]?: Loader;
  [INJECT_LOGGER]?: Logger;
  [INJECT_STATE]?: StateController;
}

@Inject(INJECT_INPUT_PLAYER, INJECT_LOGGER, INJECT_LOADER, INJECT_STATE)
export class LineRender extends EventEmitter implements Render {
  protected running: boolean;
  protected input: Input;
  protected loader: Loader;
  protected logger: Logger;
  protected state: StateController;

  protected reader?: LineInterface;

  constructor(options: LineRenderOptions) {
    super();

    this.running = false;
    this.input = mustExist(options[INJECT_INPUT_PLAYER]);
    this.loader = mustExist(options[INJECT_LOADER]);
    this.logger = mustExist(options[INJECT_LOGGER]);
    this.state = mustExist(options[INJECT_STATE]);
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

  async loop(prompt: string): Promise<void> {
    let turnCount = 0;
    let lastNow = Date.now();

    this.prompt(prompt);

    while (this.running) {
      // get and parse a line
      const line = await this.read();
      const [cmd] = await this.input.parse(line);
      this.logger.debug({
        cmd,
      }, 'parsed command');

      // handle meta commands
      switch (cmd.verb) {
        case 'debug': {
          const state = await this.state.save();
          await debugState(this, state);
          break;
        }
        case 'graph': {
          const state = await this.state.save();
          await graphState(this.loader, this, state, cmd.target);
          break;
        }
        case 'help':
          await this.show(KNOWN_VERBS.join(', '));
          break;
        case 'quit':
          return; // exit the entire loop
        default: {
          // step world
          const now = Date.now();
          const output = await this.state.step(now - lastNow);

          lastNow = now;
          turnCount = turnCount + 1;

          // show any output
          for (const outputLine of output) {
            await this.show(outputLine);
          }

          // wait for input
          this.prompt(`turn ${turnCount} > `);
        }
      }
    }
  }
}