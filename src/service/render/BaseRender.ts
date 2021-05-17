import { mustExist } from '@apextoaster/js-utils';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { Render } from '.';
import { INJECT_INPUT_PLAYER, INJECT_LOADER, INJECT_LOGGER, INJECT_STATE } from '../../module';
import { KNOWN_VERBS } from '../../util/constants';
import { debugState, graphState } from '../../util/debug';
import { Input } from '../input';
import { Loader } from '../loader';
import { StateService } from '../state';

export interface BaseRenderOptions extends BaseOptions {
  [INJECT_INPUT_PLAYER]?: Input;
  [INJECT_LOADER]?: Loader;
  [INJECT_LOGGER]?: Logger;
  [INJECT_STATE]?: StateService;
}

@Inject(INJECT_INPUT_PLAYER, INJECT_LOGGER, INJECT_LOADER, INJECT_STATE)
export abstract class BaseRender implements Render {
  protected running: boolean;
  protected input: Input;
  protected loader: Loader;
  protected logger: Logger;
  protected state: StateService;

  constructor(options: BaseRenderOptions) {
    this.running = false;
    this.input = mustExist(options[INJECT_INPUT_PLAYER]);
    this.loader = mustExist(options[INJECT_LOADER]);
    this.logger = mustExist(options[INJECT_LOGGER]);
    this.state = mustExist(options[INJECT_STATE]);
  }

  abstract prompt(prompt: string): void;
  abstract read(prompt?: string): Promise<string>;
  abstract show(msg: string): Promise<void>;
  abstract showSync(msg: string): void;
  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;

  abstract loopStep(output: Array<string>): void;

  /**
   * Loop logic should be relatively similar across render frontends, but can be overridden or hooked at `loopStep`.
   */
  public async loop(prompt: string): Promise<void> {
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
          const output = await debugState(state);
          this.loopStep(output);
          break;
        }
        case 'graph': {
          const state = await this.state.save();
          const output = await graphState(state);
          await this.loader.saveStr(cmd.target, output.join('\n'));
          this.loopStep([
            `wrote ${state.rooms.length} node graph to ${cmd.target}`,
          ]);
          break;
        }
        case 'help': {
          this.loopStep([
            KNOWN_VERBS.join(', '),
          ]);
          break;
        }
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
          this.loopStep(output);
        }
      }
    }
  }
}
