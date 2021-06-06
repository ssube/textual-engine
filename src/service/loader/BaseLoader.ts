import { doesExist, mustExist } from '@apextoaster/js-utils';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { LoaderService } from '.';
import { DataFile } from '../../model/file/Data';
import { INJECT_EVENT, INJECT_LOGGER, INJECT_PARSER } from '../../module';
import { catchAndLog } from '../../util/async/event';
import {
  EVENT_LOADER_CONFIG,
  EVENT_LOADER_DONE,
  EVENT_LOADER_READ,
  EVENT_LOADER_SAVE,
  EVENT_LOADER_STATE,
  EVENT_LOADER_WORLD,
} from '../../util/constants';
import { splitPath } from '../../util/string';
import { EventBus } from '../event';
import { Parser } from '../parser';
import { LoaderSaveEvent } from './events';

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

  protected protocols: Array<string>;

  constructor(options: BaseLoaderOptions, protocols: Array<string>) {
    this.events = mustExist(options[INJECT_EVENT]);
    this.logger = mustExist(options[INJECT_LOGGER]);
    this.parser = mustExist(options[INJECT_PARSER]);

    this.protocols = Array.from(protocols);
  }

  public async start(): Promise<void> {
    this.events.on(EVENT_LOADER_READ, (event) => {
      catchAndLog(this.onRead(event.path), this.logger, 'error during read');
    }, this);

    this.events.on(EVENT_LOADER_SAVE, (event) => {
      catchAndLog(this.onSave(event), this.logger, 'error during save');
    }, this);
  }

  public async stop(): Promise<void> {
    this.events.removeGroup(this);
  }

  public async onRead(path: string): Promise<void> {
    if (this.checkPath(path) === false) {
      return;
    }

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

    const { state } = data;
    if (doesExist(state)) {
      this.events.emit(EVENT_LOADER_STATE, {
        state,
      });
    }

    this.events.emit(EVENT_LOADER_DONE, {
      path,
    });
  }

  public async onSave(event: LoaderSaveEvent): Promise<void> {
    if (this.checkPath(event.path) === false) {
      return;
    }

    if (typeof event.data === 'string') {
      await this.saveStr(event.path, event.data);
    } else {
      const data = this.parser.save(event.data);
      await this.saveStr(event.path, data);
    }

    this.events.emit(EVENT_LOADER_DONE, {
      path: event.path,
    });
  }

  public async loadData(path: string): Promise<DataFile> {
    return this.parser.load(await this.loadStr(path));
  }

  public async saveData(path: string, data: DataFile): Promise<void> {
    return this.saveStr(path, this.parser.save(data));
  }

  public abstract dump(path: string, data: Buffer): Promise<void>;
  public abstract load(path: string): Promise<Buffer>;
  public abstract save(path: string, data: Buffer): Promise<void>;
  public abstract loadStr(path: string): Promise<string>;
  public abstract saveStr(path: string, data: string): Promise<void>;

  protected checkPath(path: string): boolean {
    const { protocol } = splitPath(path);
    return doesExist(protocol) && this.protocols.includes(protocol);
  }
}
