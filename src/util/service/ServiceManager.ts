import { mustCoalesce } from '@apextoaster/js-utils';
import { BaseOptions, Container, Inject } from 'noicejs';

import { ConfigServices } from '../../model/file/Config';
import { Service } from '../../service';
import { ActorService } from '../../service/actor';
import { LoaderService } from '../../service/loader';
import { LocaleService } from '../../service/locale';
import { RenderService } from '../../service/render';
import { StateService } from '../../service/state';
import { TokenizerService } from '../../service/tokenizer';

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
      const svc = await this.container.create<StateService, BaseOptions>(state.kind, {
        config: mustCoalesce(state.data, {}),
      });
      await svc.start();

      this.add(state.name, svc);
    }

    for (const loader of config.loaders) {
      const svc = await this.container.create<LoaderService, BaseOptions>(loader.kind, {
        config: mustCoalesce(loader.data, {}),
      });
      await svc.start();

      this.add(loader.name, svc);
    }

    for (const render of config.renders) {
      const svc = await this.container.create<RenderService, BaseOptions>(render.kind, {
        config: mustCoalesce(render.data, {}),
      });
      await svc.start();

      this.add(render.name, svc);
    }

    for (const tokenizer of config.tokenizers) {
      const svc = await this.container.create<TokenizerService, BaseOptions>(tokenizer.kind, {
        config: mustCoalesce(tokenizer.data, {}),
      });
      await svc.start();

      this.add(tokenizer.name, svc);
    }

    for (const actor of config.actors) {
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
