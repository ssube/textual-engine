import { mustExist } from '@apextoaster/js-utils';
import { Module, ModuleOptions, Provides } from 'noicejs';

import { INJECT_INPUT_MAPPER, INJECT_INPUT_PLAYER } from '.';
import { ActorType } from '../model/entity/Actor';
import { Input } from '../service/input';
import { ActorInputMapper } from '../service/input/ActorInputMapper';
import { BehaviorInput } from '../service/input/BehaviorInput';
import { ClassicInput } from '../service/input/ClassicInput';
import { Singleton } from '../util/container';

export class InputModule extends Module {
  protected mapper: Singleton<ActorInputMapper>;
  protected player: Singleton<Input>;

  constructor() {
    super();

    this.mapper = new Singleton();
    this.player = new Singleton();
  }

  public async configure(options: ModuleOptions): Promise<void> {
    await super.configure(options);
  }

  /**
   * Singleton player input.
   */
  @Provides(INJECT_INPUT_PLAYER)
  protected async getPlayerInput(): Promise<Input> {
    return this.player.get(() => mustExist(this.container).create(ClassicInput));
  }

  /**
   * Actor type input mapper.
   *
   * This construct should not exist.
   */
  @Provides(INJECT_INPUT_MAPPER)
  protected async getMapper(): Promise<ActorInputMapper> {
    return this.mapper.get(() => mustExist(this.container).create(ActorInputMapper, {
      inputs: {
        [ActorType.DEFAULT]: BehaviorInput,
        [ActorType.PLAYER]: ClassicInput,
        [ActorType.REMOTE]: BehaviorInput,
      },
    }));
  }
}
