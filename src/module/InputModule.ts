import { doesExist, mustExist } from '@apextoaster/js-utils';
import { BaseOptions, Module, ModuleOptions, Provides } from 'noicejs';

import { INJECT_INPUT_ACTOR, INJECT_INPUT_PLAYER } from '.';
import { ActorType } from '../model/entity/Actor';
import { Input } from '../service/input';
import { BehaviorInput } from '../service/input/BehaviorInput';
import { ClassicInput } from '../service/input/ClassicInput';
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
  protected actors: Map<string, Input>;
  protected player: Singleton<Input>;

  constructor() {
    super();

    this.actors = new Map();
    this.player = new Singleton();
  }

  public async configure(options: ModuleOptions): Promise<void> {
    await super.configure(options);
  }

  @Provides(INJECT_INPUT_ACTOR)
  public async getActorInput(options: ActorInputOptions): Promise<Input> {
    if (options.type === ActorType.PLAYER) {
      return this.getPlayerInput();
    } else {
      return this.getBehaviorInput(options);
    }
  }

  /**
   * Singleton player input.
   */
  @Provides(INJECT_INPUT_PLAYER)
  public async getPlayerInput(): Promise<Input> {
    return this.player.get(() => mustExist(this.container).create(ClassicInput));
  }

  public async getBehaviorInput(options: ActorInputOptions): Promise<Input> {
    const existing = this.actors.get(options.id);
    if (doesExist(existing)) {
      return existing;
    }

    const input = await options.container.create(BehaviorInput);
    this.actors.set(options.id, input);

    return input;
  }
}
