import { constructorName, mustExist } from '@apextoaster/js-utils';
import { EventEmitter } from 'events';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { EventBus } from '.';
import { INJECT_LOGGER } from '../../module';

interface EventBusOptions extends BaseOptions {
  [INJECT_LOGGER]?: Logger;
}

@Inject(INJECT_LOGGER)
export class NodeEventBus extends EventEmitter implements EventBus {
  protected logger: Logger;

  constructor(options: EventBusOptions) {
    super();

    this.logger = mustExist(options[INJECT_LOGGER]).child({
      kind: constructorName(this),
    });
  }

  public emit(name: string, ...args: Array<unknown>): boolean {
    this.logger.debug({
      eventArgs: args,
      eventName: name,
    }, 'bus proxying event');

    return super.emit(name, ...args);
  }
}
