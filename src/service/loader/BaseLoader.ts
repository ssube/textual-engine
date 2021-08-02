import { doesExist, mustExist } from '@apextoaster/js-utils';
import { Inject, Logger } from 'noicejs';

import { LoaderService } from './index.js';
import { DataFile } from '../../model/file/Data.js';
import { INJECT_EVENT, INJECT_LOGGER, INJECT_PARSER, InjectedOptions } from '../../module/index.js';
import { catchAndLog } from '../../util/async/event.js';
import {
  EVENT_LOADER_DONE,
  EVENT_LOADER_READ,
  EVENT_LOADER_SAVE,
  EVENT_LOADER_STATE,
  EVENT_LOADER_WORLD,
} from '../../util/constants.js';
import { splitPath } from '../../util/string.js';
import { EventBus } from '../event/index.js';
import { Parser } from '../parser/index.js';
import { LoaderSaveEvent } from './events.js';

@Inject(INJECT_EVENT, INJECT_LOGGER, INJECT_PARSER)
export abstract class BaseLoader implements LoaderService {
  protected events: EventBus;
  protected logger: Logger;
  protected parser: Parser;

  protected protocols: Array<string>;

  constructor(options: InjectedOptions, protocols: Array<string>) {
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

    const data = await this.loadData(path);

    // reloading config is not supported yet

    if (doesExist(data.worlds)) {
      for (const world of data.worlds) {
        this.events.emit(EVENT_LOADER_WORLD, {
          world,
        });
      }
    }

    if (doesExist(data.state)) {
      this.events.emit(EVENT_LOADER_STATE, {
        state: data.state,
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
      await this.saveData(event.path, event.data);
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

  public abstract load(path: string): Promise<Buffer>;
  public abstract save(path: string, data: Buffer): Promise<void>;
  public abstract loadStr(path: string): Promise<string>;
  public abstract saveStr(path: string, data: string): Promise<void>;

  protected checkPath(path: string): boolean {
    const { protocol } = splitPath(path);
    return doesExist(protocol) && this.protocols.includes(protocol);
  }
}
