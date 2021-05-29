import { mustExist } from '@apextoaster/js-utils';
import { Inject } from 'noicejs';
import * as React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import { RenderService } from '..';
import { Frame } from '../../../component/react/Frame';
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
    render([elem], document.getElementById('app'));
  }
}
