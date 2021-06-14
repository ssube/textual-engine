import { doesExist, getOrDefault } from '@apextoaster/js-utils';
import { EventEmitter } from 'events';
import { Inject, Logger } from 'noicejs';

import { EventBus, EventGroup } from '.';
import { INJECT_LOGGER, InjectedOptions } from '../../module';
import { EventHandler } from '../../util/async/event';
import { makeServiceLogger } from '../../util/service';

@Inject(INJECT_LOGGER)
export class NodeEventBus extends EventEmitter implements EventBus {
  protected handlers: Map<EventGroup, Array<[string, EventHandler<unknown>]>>;
  protected logger: Logger;

  constructor(options: InjectedOptions) {
    super();

    this.handlers = new Map();
    this.logger = makeServiceLogger(options[INJECT_LOGGER], this);
  }

  public emit(name: string, ...args: Array<unknown>): boolean {
    this.logger.debug({
      event: {
        args,
        name,
      },
    }, 'bus proxying event');

    return super.emit(name, ...args);
  }

  public on(name: string, handler: EventHandler<any>, group?: EventGroup): this {
    if (doesExist(group)) {
      const existing = getOrDefault(this.handlers, group, []);
      existing.push([name, handler]);
      this.handlers.set(group, existing);
    }

    return super.on(name, handler);
  }

  public removeGroup(group: EventGroup): void {
    const handlers = this.handlers.get(group);
    if (doesExist(handlers)) {
      for (const [name, handler] of handlers) {
        this.removeListener(name, handler);
      }
    }
  }
}
