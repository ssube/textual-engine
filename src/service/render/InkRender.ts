import { doesExist, mustExist } from '@apextoaster/js-utils';
import { Instance as InkInstance, render } from 'ink';
import { Inject } from 'noicejs';
import * as React from 'react';

import { RenderService } from '.';
import { Frame } from '../../component/ink/Frame';
import { BaseReactRender } from './BaseReactRender';

/**
 * Interface with Ink's React tree using an event emitter.
 */
@Inject(/* from base */)
export class InkRender extends BaseReactRender implements RenderService {
  protected ink?: InkInstance;

  public async start(): Promise<void> {
    this.logger.debug('starting Ink render');

    this.renderRoot();
    this.prompt(`turn ${this.step.turn}`);

    this.event.on('actor-output', (output) => this.onOutput(output));
    this.event.on('state-room', (room) => this.onRoom(room));
    this.event.on('state-step', (step) => this.onStep(step));
    this.event.on('quit', () => this.onQuit());
  }

  public async stop(): Promise<void> {
    this.logger.debug('stopping Ink render');
    mustExist(this.ink).unmount();

    // TODO: remove event handlers from state
  }

  /**
   * Handler for lines received from the React tree.
   */
  public nextLine(line: string): void {
    this.logger.debug({ line }, 'handling line event from React');

    // update inner state
    this.inputStr = line;

    // append to buffer
    this.output.push(`${this.promptStr} > ${this.inputStr}`);

    // forward event to state
    this.event.emit('render-output', {
      lines: [line],
    });
  }

  protected renderRoot(): void {
    const elem = React.createElement(Frame, {
      onLine: (line: string) => this.nextLine(line),
      prompt: this.promptStr,
      output: this.output,
      step: this.step,
    });

    if (doesExist(this.ink)) {
      this.ink.rerender(elem);
    } else {
      this.ink = render(elem);
    }
  }
}
