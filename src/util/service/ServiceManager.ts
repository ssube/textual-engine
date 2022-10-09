import { InvalidArgumentError, mustCoalesce } from '@apextoaster/js-utils';
import { BaseOptions, Container, Inject } from 'noicejs';

import { ConfigServices } from '../../model/file/Config.js';
import { Service } from '../../service/index.js';
import { ActorService } from '../../service/actor/index.js';
import { LoaderService } from '../../service/loader/index.js';
import { RenderService } from '../../service/render/index.js';
import { StateService } from '../../service/state/index.js';
import { TokenizerService } from '../../service/tokenizer/index.js';

@Inject()
export class ServiceManager {
  protected container: Container;
  protected services: Map<string, Service>;

  constructor(options: BaseOptions) {
    this.container = options.container;
    this.services = new Map();
  }

  public add(name: string, svc: Service): void {
    this.services.set(name, svc);
  }

  public async create(config: ConfigServices): Promise<void> {
    for (const state of config.states) {
      if (this.services.has(state.name)) {
        throw new InvalidArgumentError('state service already exists');
      }

      const svc = await this.container.create<StateService, BaseOptions>(state.kind, {
        config: mustCoalesce(state.data, {}),
      });
      await svc.start();

      this.add(state.name, svc);
    }

    for (const loader of config.loaders) {
      if (this.services.has(loader.name)) {
        throw new InvalidArgumentError('loader service already exists');
      }

      const svc = await this.container.create<LoaderService, BaseOptions>(loader.kind, {
        config: mustCoalesce(loader.data, {}),
      });
      await svc.start();

      this.add(loader.name, svc);
    }

    for (const render of config.renders) {
      if (this.services.has(render.name)) {
        throw new InvalidArgumentError('render service already exists');
      }

      const svc = await this.container.create<RenderService, BaseOptions>(render.kind, {
        config: mustCoalesce(render.data, {}),
      });
      await svc.start();

      this.add(render.name, svc);
    }

    for (const tokenizer of config.tokenizers) {
      if (this.services.has(tokenizer.name)) {
        throw new InvalidArgumentError('tokenizer service already exists');
      }

      const svc = await this.container.create<TokenizerService, BaseOptions>(tokenizer.kind, {
        config: mustCoalesce(tokenizer.data, {}),
      });
      await svc.start();

      this.add(tokenizer.name, svc);
    }

    for (const actor of config.actors) {
      if (this.services.has(actor.name)) {
        throw new InvalidArgumentError('actor service already exists');
      }

      const svc = await this.container.create<ActorService, BaseOptions>(actor.kind, {
        config: mustCoalesce(actor.data, {}),
      });
      await svc.start();

      this.add(actor.name, svc);
    }
  }

  public async stop(): Promise<void> {
    for (const [_name, svc] of this.services) {
      await svc.stop();
    }
  }
}
