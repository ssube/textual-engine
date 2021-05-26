import { doesExist, mustExist } from '@apextoaster/js-utils';
import { Module, ModuleOptions } from 'noicejs';

import { INJECT_ACTOR, INJECT_TOKENIZER } from '.';
import { ActorType } from '../model/entity/Actor';
import { ActorService } from '../service/actor';
import { BehaviorActorService } from '../service/actor/BehaviorActor';
import { PlayerActorService } from '../service/actor/PlayerActor';
import { TokenizerService } from '../service/tokenizer';
import { WordTokenizer } from '../service/tokenizer/WordTokenizer';
import { Singleton } from '../util/container';

export interface ActorInputOptions {
  type: ActorType;
  id: string;
}

export interface ActorLocator {
  clear(): void;
  get(options: ActorInputOptions): Promise<ActorService>;
}

/**
 * Provide the input implementations, based on actor type.
 *
 * This is not the nicest construct, but keeps everything contained until I can find a better way to link them.
 */
export class ActorModule extends Module {
  protected actors: Map<string, ActorService>;
  protected locator: ActorLocator;
  protected player: Singleton<ActorService>;
  protected playerStarted: boolean;
  protected tokenizer: Singleton<TokenizerService>;

  constructor() {
    super();

    this.actors = new Map();
    this.locator = {
      clear: () => this.actors.clear(),
      get: (options) => this.getActorInput(options),
    };
    this.player = new Singleton(() => mustExist(this.container).create(PlayerActorService));
    this.tokenizer = new Singleton(() => mustExist(this.container).create(WordTokenizer));
    this.playerStarted = false;
  }

  public async configure(options: ModuleOptions): Promise<void> {
    await super.configure(options);

    this.bind(INJECT_ACTOR).toInstance(this.locator);
    this.bind(INJECT_TOKENIZER).toFactory(() => this.tokenizer.get());
  }

  public async getActorInput(options: ActorInputOptions): Promise<ActorService> {
    if (options.type === ActorType.PLAYER) {
      return this.player.get();
    } else {
      return this.getBehaviorActor(options);
    }
  }

  public async getBehaviorActor(options: ActorInputOptions): Promise<ActorService> {
    const existing = this.actors.get(options.id);
    if (doesExist(existing)) {
      return existing;
    }

    const actor = await mustExist(this.container).create(BehaviorActorService, {
      actor: options.id,
    });

    this.actors.set(options.id, actor);

    await actor.start();

    return actor;
  }
}
