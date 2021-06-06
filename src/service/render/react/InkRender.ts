import { doesExist } from '@apextoaster/js-utils';
import { Instance as InkInstance, render } from 'ink';
import { Inject } from 'noicejs';
import * as React from 'react';

import { RenderService } from '..';
import { Frame } from '../../../component/ink/Frame';
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

    if (doesExist(this.ink)) {
      this.ink.unmount();
    }

    return super.stop();
  }

  public update(): void {
    const elem = React.createElement(Frame, {
      onLine: (line: string) => this.nextLine(line),
      output: this.output,
      prompt: this.prompt,
      quit: this.quit,
      shortcuts: this.shortcuts,
      step: this.step,
    });

    if (doesExist(this.ink)) {
      this.ink.rerender(elem);
    } else {
      this.ink = render(elem);
    }
  }
}
