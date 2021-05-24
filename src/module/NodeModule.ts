import { mustExist } from '@apextoaster/js-utils';
import { Module, ModuleOptions, Provides } from 'noicejs';

import { INJECT_LOADER, INJECT_RENDER } from '.';
import { FileLoader } from '../service/loader/FileLoader';
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

    this.bind(INJECT_LOADER).toConstructor(FileLoader);
  }

  @Provides(INJECT_RENDER)
  protected async getRender(): Promise<RenderService> {
    return this.render.get();
  }
}
