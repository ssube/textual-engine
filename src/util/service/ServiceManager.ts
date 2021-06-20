import { mustCoalesce } from '@apextoaster/js-utils';
import { BaseOptions, Container, Inject } from 'noicejs';
import { ConfigServices } from '../../model/file/Config';
import { Service } from '../../service';
import { LocaleService } from '../../service/locale';
import { StateService } from '../../service/state';

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
    for (const loader of config.loaders) {
      const svc = await this.container.create<LocaleService, BaseOptions>(loader.kind, {
        config: mustCoalesce(loader.data, {}),
      });
      await svc.start();

      this.add(loader.name, svc);
    }

    // for (const locale of config.locales) {}
    // for (const tokenizer of config.tokenizers) {}

    for (const actor of config.actors) {
      const svc = await this.container.create<LocaleService, BaseOptions>(actor.kind, {
        config: mustCoalesce(actor.data, {}),
      });
      await svc.start();

      this.add(actor.name, svc);
    }

    for (const render of config.renders) {
      const svc = await this.container.create<LocaleService, BaseOptions>(render.kind, {
        config: mustCoalesce(render.data, {}),
      });
      await svc.start();

      this.add(render.name, svc);
    }

    for (const state of config.states) {
      const svc = await this.container.create<StateService, BaseOptions>(state.kind, {
        config: mustCoalesce(state.data, {}),
      });
      await svc.start();

      this.add(state.name, svc);
    }
  }

  public async stop(): Promise<void> {
    for (const [_name, svc] of this.services) {
      await svc.stop();
    }
  }
}
