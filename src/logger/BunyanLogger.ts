import { constructorName } from '@apextoaster/js-utils';
import { createLogger, LoggerOptions, stdSerializers } from 'bunyan';
import { Logger } from 'noicejs';

/**
 * Attach bunyan to the Logger. Does very little, since bunyan matches the Logger interface.
 */
export class BunyanLogger {
  public static create(options: LoggerOptions): Logger {
    return createLogger({
      ...options,
      serializers: {
        ...stdSerializers,
        container: constructorName,
        logger: constructorName,
        module: constructorName,
      },
    });
  }
}
