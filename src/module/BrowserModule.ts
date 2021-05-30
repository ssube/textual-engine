import { Module, ModuleOptions } from 'noicejs';

import { BrowserFetchLoader } from '../service/loader/browser/FetchLoader';
import { BrowserPageLoader } from '../service/loader/browser/PageLoader';
import { ReactDomRender } from '../service/render/react/DomRender';

export class BrowserModule extends Module {
  public async configure(options: ModuleOptions): Promise<void> {
    await super.configure(options);

    this.bind('browser-fetch-loader').toConstructor(BrowserFetchLoader);
    this.bind('browser-page-loader').toConstructor(BrowserPageLoader);
    this.bind('browser-dom-render').toConstructor(ReactDomRender);
  }
}
