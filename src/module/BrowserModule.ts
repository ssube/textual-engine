import { mustExist } from '@apextoaster/js-utils';
import { Module, ModuleOptions, Provides } from 'noicejs';

import { INJECT_LOADER, INJECT_RENDER } from '.';
import { BrowserFetchLoader } from '../service/loader/browser/FetchLoader';
import { BrowserPageLoader } from '../service/loader/browser/PageLoader';
import { RenderService } from '../service/render';
import { ReactDomRender } from '../service/render/ReactDomRender';
import { Singleton } from '../util/container';

export class BrowserModule extends Module {
  protected render: Singleton<RenderService>;

  constructor() {
    super();

    this.render = new Singleton(() => mustExist(this.container).create(ReactDomRender));
  }

  public async configure(options: ModuleOptions): Promise<void> {
    await super.configure(options);

    if (true) {
      this.bind(INJECT_LOADER).toConstructor(BrowserFetchLoader);
    } else {
      this.bind(INJECT_LOADER).toConstructor(BrowserPageLoader);
    }
  }

  @Provides(INJECT_RENDER)
  protected async getRender(): Promise<RenderService> {
    return this.render.get();
  }
}
