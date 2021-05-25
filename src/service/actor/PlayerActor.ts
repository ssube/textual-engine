import { constructorName, mustExist, NotImplementedError } from '@apextoaster/js-utils';
import { EventEmitter } from 'events';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { ActorService, InputEvent } from '.';
import { Command } from '../../model/Command';
import { INJECT_LOCALE, INJECT_LOGGER, INJECT_TOKENIZER } from '../../module';
import { VERB_WAIT } from '../../util/constants';
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
  [INJECT_LOGGER]?: Logger;
  [INJECT_TOKENIZER]?: TokenizerService;
}

/**
 * Behavioral input generates commands based on the actor's current
 * state (room, inventory, etc).
 */
@Inject(INJECT_LOCALE, INJECT_LOGGER, INJECT_TOKENIZER)
export class PlayerActorService extends EventEmitter implements ActorService {
  protected history: Array<Command>;
  protected locale: LocaleService;
  protected logger: Logger;
  protected tokenizer: TokenizerService;

  constructor(options: PlayerActorOptions) {
    super();

    this.history = [];
    this.locale = mustExist(options[INJECT_LOCALE]);
    this.logger = mustExist(options[INJECT_LOGGER]).child({
      kind: constructorName(PlayerActorService),
    });
    this.tokenizer = mustExist(options[INJECT_TOKENIZER]);
  }

  public async start() {
    this.on('input', (event: InputEvent) => this.doInput(event));
    this.on('room', async () => {
      this.emit('command', {
        command: await this.last(),
      });
    });
  }

  public async stop() {
    /* noop */
  }

  public async translate(verbs: Array<string>): Promise<void> {
    throw new NotImplementedError();
  }

  public async last(): Promise<Command> {
    return this.history[this.history.length - 1];
  }

  public async doInput(event: InputEvent): Promise<void> {
    this.logger.debug({ event }, 'tokenizing input');

    for (const line of event.lines) {
      const commands = await this.tokenizer.parse(line);
      this.history.push(...commands);

      for (const command of commands) {
        this.emit('command', {
          command,
        });
      }
    }
  }
}
