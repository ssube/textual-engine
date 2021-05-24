import { mustExist } from '@apextoaster/js-utils';
import { Module, ModuleOptions, Provides } from 'noicejs';

import { INJECT_LOADER, INJECT_RENDER } from '.';
import { PageLoader } from '../service/loader/PageLoader';
import { RenderService } from '../service/render';
import { ReactRender } from '../service/render/ReactRender';
import { Singleton } from '../util/container';

export class BrowserModule extends Module {
  protected render: Singleton<RenderService>;

  constructor() {
    super();

    this.render = new Singleton(() => mustExist(this.container).create(ReactRender));
  }

  public async configure(options: ModuleOptions): Promise<void> {
    await super.configure(options);

    this.bind(INJECT_LOADER).toConstructor(PageLoader);
  }

  @Provides(INJECT_RENDER)
  protected async getRender(): Promise<RenderService> {
    return this.render.get();
  }
}
