import { mustExist } from '@apextoaster/js-utils';
import { Module, ModuleOptions, Provides } from 'noicejs';

import { INJECT_LOADER, INJECT_RENDER } from '.';
import { NodeFetchLoader } from '../service/loader/node/FetchLoader';
import { NodeFileLoader } from '../service/loader/node/FileLoader';
import { RenderService } from '../service/render';
import { InkRender } from '../service/render/InkRender';
import { LineRender } from '../service/render/LineRender';
import { Singleton } from '../util/container';

export class NodeModule extends Module {
  protected render: Singleton<RenderService>;

  constructor() {
    super();

    if (true) {
      this.render = new Singleton(() => mustExist(this.container).create(InkRender));
    } else {
      this.render = new Singleton(() => mustExist(this.container).create(LineRender));
    }
  }

  public async configure(options: ModuleOptions): Promise<void> {
    await super.configure(options);

    if (true) {
      this.bind(INJECT_LOADER).toConstructor(NodeFileLoader);
    } else {
      this.bind(INJECT_LOADER).toConstructor(NodeFetchLoader);
    }
  }

  @Provides(INJECT_RENDER)
  protected async getRender(): Promise<RenderService> {
    return this.render.get();
  }
}
