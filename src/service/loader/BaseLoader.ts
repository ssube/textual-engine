import { doesExist, mustExist } from '@apextoaster/js-utils';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { LoaderService } from '.';
import { INJECT_EVENT, INJECT_LOGGER, INJECT_PARSER } from '../../module';
import { EVENT_LOADER_CONFIG, EVENT_LOADER_PATH, EVENT_LOADER_STATE, EVENT_LOADER_WORLD } from '../../util/constants';
import { catchAndLog } from '../../util/event';
import { EventBus } from '../event';
import { Parser } from '../parser';

export interface BaseLoaderOptions extends BaseOptions {
  [INJECT_EVENT]?: EventBus;
  [INJECT_LOGGER]?: Logger;
  [INJECT_PARSER]?: Parser;
}

@Inject(INJECT_EVENT, INJECT_LOGGER, INJECT_PARSER)
export abstract class BaseLoader implements LoaderService {
  protected events: EventBus;
  protected logger: Logger;
  protected parser: Parser;

  constructor(options: BaseLoaderOptions) {
    this.events = mustExist(options[INJECT_EVENT]);
    this.logger = mustExist(options[INJECT_LOGGER]);
    this.parser = mustExist(options[INJECT_PARSER]);
  }

  public async start(): Promise<void> {
    this.events.on(EVENT_LOADER_PATH, (event) => {
      catchAndLog(this.onPath(event.path), this.logger, 'error during path');
    }, this);
  }

  public async stop(): Promise<void> {
    this.events.removeGroup(this);
  }

  public async onPath(path: string): Promise<void> {
    const dataStr = await this.loadStr(path);
    const data = this.parser.load(dataStr);

    if (doesExist(data.config)) {
      this.events.emit(EVENT_LOADER_CONFIG, {
        config: data.config,
      });

      return;
    }

    for (const world of data.worlds) {
      this.events.emit(EVENT_LOADER_WORLD, {
        world,
      });
    }

    if (doesExist(data.state)) {
      this.events.emit(EVENT_LOADER_STATE, {
        state: data.state,
      });
    }
  }

  public abstract dump(path: string, data: Buffer): Promise<void>;
  public abstract load(path: string): Promise<Buffer>;
  public abstract save(path: string, data: Buffer): Promise<void>;
  public abstract loadStr(path: string): Promise<string>;
  public abstract saveStr(path: string, data: string): Promise<void>;
}
