import { NotFoundError } from '@apextoaster/js-utils';
import { BaseOptions } from 'noicejs';

import { Input } from '.';
import { Actor, ActorType } from '../../model/entity/Actor';

export type InputTypes = Record<ActorType, Input>;

export interface ActorInputMapperOptions extends BaseOptions {
  inputs: InputTypes;
}

export class ActorInputMapper {
  protected actors: Map<string, Input>;
  protected inputs: InputTypes;

  constructor(options: ActorInputMapperOptions) {
    this.actors = new Map();
    this.inputs = options.inputs;
  }

  add(actor: Actor) {
    this.actors.set(actor.meta.id, this.inputs[actor.actorType]);
  }

  get(actor: Actor): Input {
    const input = this.actors.get(actor.meta.id);
    if (input) {
      return input;
    } else {
      throw new NotFoundError('no input for actor');
    }
  }

  async history(): Promise<Map<string, Array<string>>> {
    const history = new Map();
    for (const [actor, input] of this.actors) {
      history.set(actor, await input.last());
    }
    return history;
  }

  protected getInput(type: ActorType): Input {
    const input = this.inputs[type];
    if (input) {
      return input;
    } else {
      return this.inputs[ActorType.DEFAULT];
    }
  }
}