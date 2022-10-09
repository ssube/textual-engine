import { constructorName } from '@apextoaster/js-utils';
import bunyan, { LoggerOptions } from 'bunyan';
import { Logger } from 'noicejs';

import { entityMeta } from '../util/logger.js';

const { createLogger, stdSerializers } = bunyan;

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
        portal: entityMeta,
        room: entityMeta,
      },
    });
  }
}
