import { mustExist } from '@apextoaster/js-utils';
import { Inject } from 'noicejs';
import * as React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import { RenderService } from '..';
import { Frame } from '../../../component/react/Frame';
import { EVENT_RENDER_OUTPUT } from '../../../util/constants';
import { BaseReactRender } from './BaseRender';

/**
 * Interface with React tree using an event emitter.
 */
@Inject(/* from base */)
export class ReactDomRender extends BaseReactRender implements RenderService {
  public async start(): Promise<void> {
    this.logger.debug('starting React render');

    return super.start();
  }

  public async stop(): Promise<void> {
    this.logger.debug('stopping React render');

    // TODO: does unmounting hide game over screen?
    const elem = mustExist(document.getElementById('app'));
    unmountComponentAtNode(elem);

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

    if (line.length > 0) {
      // forward event to state
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
    render([elem], document.getElementById('app'));
  }
}
