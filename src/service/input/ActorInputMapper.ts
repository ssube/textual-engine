import { NotFoundError } from '@apextoaster/js-utils';
import { BaseOptions, Constructor, Container } from 'noicejs';

import { Input } from '.';
import { Actor, ActorType } from '../../model/entity/Actor';

export type InputCtor = Constructor<Input, BaseOptions>;
export type InputTypes = Record<ActorType, InputCtor | symbol>;

export interface ActorInputMapperOptions extends BaseOptions {
  inputs: InputTypes;
}

export class ActorInputMapper {
  protected actors: Map<string, Input>;
  protected container: Container;
  protected types: InputTypes;

  constructor(options: ActorInputMapperOptions) {
    this.actors = new Map();
    this.container = options.container;
    this.types = options.inputs;
  }

  async add(actor: Actor): Promise<Input> {
    const inputType = this.types[actor.actorType];
    const input = await this.container.create<Input, BaseOptions>(inputType);
    this.actors.set(actor.meta.id, input);
    return input;
  }

  async get(actor: Actor): Promise<Input> {
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
}