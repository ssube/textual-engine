import { Module, ModuleOptions } from 'noicejs';

import { NodeFetchLoader } from '../service/loader/node/FetchLoader.js';
import { NodeFileLoader } from '../service/loader/node/FileLoader.js';
import { LineRender } from '../service/render/LineRender.js';
import { InkRender } from '../service/render/react/InkRender.js';

export class NodeModule extends Module {
  public async configure(options: ModuleOptions): Promise<void> {
    await super.configure(options);

    this.bind('node-file-loader').toConstructor(NodeFileLoader);
    this.bind('node-fetch-loader').toConstructor(NodeFetchLoader);
    this.bind('node-ink-render').toConstructor(InkRender);
    this.bind('node-line-render').toConstructor(LineRender);
  }
}
