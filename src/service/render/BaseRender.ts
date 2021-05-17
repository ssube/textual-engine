import { mustExist } from '@apextoaster/js-utils';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { Render } from '.';
import { INJECT_INPUT_PLAYER, INJECT_LOADER, INJECT_LOGGER, INJECT_STATE } from '../../module';
import { Input } from '../input';
import { StateService, StepResult } from '../state';

export interface BaseRenderOptions extends BaseOptions {
  [INJECT_INPUT_PLAYER]?: Input;
  [INJECT_LOGGER]?: Logger;
  [INJECT_STATE]?: StateService;
}

@Inject(INJECT_INPUT_PLAYER, INJECT_LOGGER, INJECT_LOADER, INJECT_STATE)
export abstract class BaseRender implements Render {
  protected running: boolean;
  protected logger: Logger;
  protected state: StateService;

  constructor(options: BaseRenderOptions) {
    this.running = false;
    this.logger = mustExist(options[INJECT_LOGGER]);
    this.state = mustExist(options[INJECT_STATE]);
  }

  abstract prompt(prompt: string): void;
  abstract read(prompt?: string): Promise<string>;
  abstract show(msg: string): Promise<void>;
  abstract showSync(msg: string): void;
  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;

  public async showStep(result: StepResult): Promise<void> {
    // show any output
    for (const outputLine of result.output) {
      await this.show(outputLine);
    }

    this.prompt(`turn ${result.turn} > `);
  }

  /**
   * Loop logic should be relatively similar across render frontends, but can be overridden or hooked at `loopStep`.
   */
  public async loop(prompt: string): Promise<void> {
    let time = Date.now();

    this.prompt(prompt);

    while (this.running) {
      // get and parse a line
      const line = await this.read();
      this.logger.debug({
        line,
      }, 'read line, starting step');

      // step the state
      const result = await this.state.step({
        line,
        time,
      });

      await this.showStep(result);

      time = result.time;
      this.running = result.stop === false;
    }
  }
}
