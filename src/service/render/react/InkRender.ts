import { doesExist, mustExist } from '@apextoaster/js-utils';
import { Instance as InkInstance, render } from 'ink';
import { Inject } from 'noicejs';
import * as React from 'react';

import { RenderService } from '..';
import { Frame } from '../../../component/ink/Frame';
import { EVENT_RENDER_OUTPUT } from '../../../util/constants';
import { BaseReactRender } from './BaseRender';

/**
 * Interface with Ink's React tree using an event emitter.
 */
@Inject(/* from base */)
export class InkRender extends BaseReactRender implements RenderService {
  protected ink?: InkInstance;

  public async start(): Promise<void> {
    this.logger.debug('starting Ink render');

    return super.start();
  }

  public async stop(): Promise<void> {
    this.logger.debug('stopping Ink render');
    mustExist(this.ink).unmount();

    return super.stop();
  }

  /**
   * Handler for lines received from the React tree.
   */
  public nextLine(line: string): void {
    this.logger.debug({ line }, 'handling line event from React');

    // update inner state
    this.input = line;

    // append to buffer
    this.output.push(`${this.prompt} > ${this.input}`);

    // forward event to state
    if (line.length > 0) {
      this.event.emit(EVENT_RENDER_OUTPUT, {
        lines: [line],
      });
    }
  }

  protected renderRoot(): void {
    const elem = React.createElement(Frame, {
      onLine: (line: string) => this.nextLine(line),
      output: this.output,
      prompt: this.prompt,
      quit: this.quit,
      step: this.step,
    });

    if (doesExist(this.ink)) {
      this.ink.rerender(elem);
    } else {
      this.ink = render(elem);
    }
  }
}
