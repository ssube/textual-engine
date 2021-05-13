import { Input } from '.';
import { Actor, ActorType } from '../../models/entity/Actor';

export type InputMapperOptions = Record<ActorType, Input>;

export class ActorInputMapper {
  protected actors: Map<string, Input>;
  protected inputs: InputMapperOptions;

  constructor(options: InputMapperOptions) {
    this.actors = new Map();
    this.inputs = options;
  }

  add(actor: Actor) {
    this.actors.set(actor.meta.id, this.inputs[actor.kind]);
  }

  get(actor: Actor): Input {
    const input = this.actors.get(actor.meta.id);
    if (input) {
      return input;
    } else {
      throw new Error('no input for actor');
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