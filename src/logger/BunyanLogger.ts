import { constructorName } from '@apextoaster/js-utils';
import { createLogger, LoggerOptions, stdSerializers } from 'bunyan';
import { Logger } from 'noicejs';

import { isActor } from '../model/entity/Actor';
import { isItem } from '../model/entity/Item';
import { isRoom } from '../model/entity/Room';

export function entityMeta(entity: any): object {
  if (isActor(entity) || isItem(entity) || isRoom(entity)) {
    return entity.meta;
  } else {
    return entity;
  }
}

/**
 * Attach bunyan to the Logger. Does very little, since bunyan matches the Logger interface.
 */
export class BunyanLogger {
  public static create(options: LoggerOptions): Logger {
    return createLogger({
      ...options,
      serializers: {
        ...stdSerializers,
        actor: entityMeta,
        container: constructorName,
        item: entityMeta,
        logger: constructorName,
        module: constructorName,
        room: entityMeta,
      },
    });
  }
}
