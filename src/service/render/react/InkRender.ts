import { doesExist } from '@apextoaster/js-utils';
import { Instance as InkInstance, render } from 'ink';
import { Inject } from 'noicejs';
import * as React from 'react';
import { I18nextProvider } from 'react-i18next';

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
    const frame = React.createElement(Frame, {
      onLine: (line: string) => this.nextLine(line),
      output: this.output,
      prompt: this.prompt,
      quit: this.quit,
      shortcuts: this.shortcuts,
      show: {
        shortcuts: this.config.shortcuts,
      },
      step: this.step,
    });

    const locale = React.createElement(I18nextProvider, {
      i18n: this.locale.getInstance(),
    }, frame);

    if (doesExist(this.ink)) {
      this.ink.rerender(locale);
    } else {
      this.ink = render(locale);
    }
  }
}
