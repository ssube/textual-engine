import { mustExist } from '@apextoaster/js-utils';
import { Inject } from 'noicejs';
import * as React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { I18nextProvider } from 'react-i18next';

import { RenderService } from '..';
import { Frame } from '../../../component/react/Frame';
import { InjectedOptions } from '../../../module';
import { BaseReactRender } from './BaseRender';

/**
 * Interface with React tree using an event emitter.
 */
@Inject(/* from base */)
export class ReactDomRender extends BaseReactRender implements RenderService {
  protected cleanup: boolean;

  constructor(options: InjectedOptions) {
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
    const frame = React.createElement(Frame, {
      onLine: (line: string) => this.nextLine(line),
      output: this.output,
      prompt: this.prompt,
      quit: this.quit,
      shortcuts: this.shortcuts,
      show: {
        shortcuts: this.config.shortcuts,
        status: this.config.status,
      },
      stats: this.stats,
      step: this.step,
      worlds: this.worlds,
    });
    const locale = React.createElement(I18nextProvider, {
      i18n: this.locale.getInstance(),
    }, frame);

    render(locale, document.getElementById('app'));
  }
}
