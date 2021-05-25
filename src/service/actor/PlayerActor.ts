import { mustExist, NotImplementedError } from '@apextoaster/js-utils';
import { EventEmitter } from 'events';
import { BaseOptions } from 'noicejs';

import { ActorService, InputEvent, OutputEvent, RoomEvent } from '.';
import { Command } from '../../model/Command';
import { INJECT_LOCALE, INJECT_TOKENIZER } from '../../module';
import { KNOWN_VERBS, VERB_WAIT } from '../../util/constants';
import { debugState, graphState } from '../../util/debug';
import { LocaleService } from '../locale';
import { TokenizerService } from '../tokenizer';

const WAIT_CMD: Command = {
  index: 0,
  input: `${VERB_WAIT} turn`,
  verb: VERB_WAIT,
  target: 'turn',
};

export interface PlayerActorOptions extends BaseOptions {
  [INJECT_LOCALE]?: LocaleService;
  [INJECT_TOKENIZER]?: TokenizerService;
}

/**
 * Behavioral input generates commands based on the actor's current
 * state (room, inventory, etc).
 */
export class PlayerActorService extends EventEmitter implements ActorService {
  protected locale: LocaleService;
  protected tokenizer: TokenizerService;

  constructor(options: PlayerActorOptions) {
    super();

    this.locale = mustExist(options[INJECT_LOCALE]);
    this.tokenizer = mustExist(options[INJECT_TOKENIZER]);
  }

  public async translate(verbs: Array<string>): Promise<void> {
    throw new NotImplementedError();
  }

  public async last(): Promise<Command> {
    return WAIT_CMD;
  }

  public async doDebug(): Promise<void> {
    const lines = debugState(state);
    this.emit('output', {
      lines,
    });
  }

  public async doHelp(): Promise<void> {
    const verbs = KNOWN_VERBS.map((it) => this.locale.translate(it)).join(', ');
    this.emit('output', {
      lines: [verbs],
    });
  }

  public async doGraph(path: string): Promise<void> {
    const state = await this.save();
    const lines = graphState(state);

    await this.loader.saveStr(path, lines.join('\n'));

    this.emit('output', {
      lines: [
        this.locale.translate('debug.graph.summary', {
          path,
          size: state.rooms.length,
        }),
      ]
    });
  }
}
