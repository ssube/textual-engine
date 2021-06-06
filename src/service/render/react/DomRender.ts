import { mustExist } from '@apextoaster/js-utils';
import { Inject } from 'noicejs';
import * as React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import { RenderService } from '..';
import { Frame } from '../../../component/react/Frame';
import { BaseReactRender, BaseRenderOptions } from './BaseRender';

/**
 * Interface with React tree using an event emitter.
 */
@Inject(/* from base */)
export class ReactDomRender extends BaseReactRender implements RenderService {
  protected cleanup: boolean;

  constructor(options: BaseRenderOptions) {
    super(options);

    this.cleanup = false;
  }

  public async start(): Promise<void> {
    this.logger.debug('starting React render');

    return super.start();
  }

  public async stop(): Promise<void> {
    this.logger.debug('stopping React render');

    if (this.cleanup) {
      const elem = mustExist(document.getElementById('app'));
      unmountComponentAtNode(elem);
    }

    return super.stop();
  }

  public update(): void {
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
