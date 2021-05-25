import { doesExist, mustExist } from '@apextoaster/js-utils';
import { BaseOptions, Module, ModuleOptions, Provides } from 'noicejs';

import { INJECT_ACTOR, INJECT_ACTOR_PLAYER } from '.';
import { ActorType } from '../model/entity/Actor';
import { ActorService } from '../service/actor';
import { BehaviorActorService } from '../service/actor/BehaviorActor';
import { PlayerActorService } from '../service/actor/PlayerActor';
import { Singleton } from '../util/container';

export interface ActorInputOptions extends BaseOptions {
  type: ActorType;
  id: string;
}

/**
 * Provide the input implementations, based on actor type.
 *
 * This is not the nicest construct, but keeps everything contained until I can find a better way to link them.
 */
export class InputModule extends Module {
  protected actors: Map<string, ActorService>;
  protected player: Singleton<ActorService>;

  constructor() {
    super();

    this.actors = new Map();
    this.player = new Singleton(() => mustExist(this.container).create(PlayerActorService));
  }

  public async configure(options: ModuleOptions): Promise<void> {
    await super.configure(options);
  }

  @Provides(INJECT_ACTOR)
  public async getActorInput(options: ActorInputOptions): Promise<ActorService> {
    if (options.type === ActorType.PLAYER) {
      return this.getPlayerInput();
    } else {
      return this.getBehaviorActor(options);
    }
  }

  /**
   * Singleton player input.
   */
  @Provides(INJECT_ACTOR_PLAYER)
  public async getPlayerInput(): Promise<ActorService> {
    return this.player.get();
  }

  public async getBehaviorActor(options: ActorInputOptions): Promise<ActorService> {
    const existing = this.actors.get(options.id);
    if (doesExist(existing)) {
      return existing;
    }

    const actor = await options.container.create(BehaviorActorService);
    this.actors.set(options.id, actor);

    return actor;
  }
}
