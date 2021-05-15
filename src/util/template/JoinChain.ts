import { InvalidArgumentError } from '@apextoaster/js-utils';
import { RandomGenerator } from '../../service/random';

export type InputChain = Array<string | InputChain>;

interface JoinOptions {
  joiners: Array<string>;
  random: RandomGenerator;
}

/**
 * A string building construct that:
 * 
 * - takes a nested list of input fragments
 * - takes a list of joiners and operators (TODO)
 * - for each fragment of the input chain:
 *   - modulo select a joiner
 *   - TODO: modulo select an operator
 *   - select one or more items using level operator
 *     - recurse into child chains
 *   - join items with level joiner
 */
export class JoinChain {
  protected joiners: Array<string>;
  protected random: RandomGenerator;

  constructor(options: JoinOptions) {
    this.joiners = options.joiners;
    this.random = options.random;
  }

  render(chain: InputChain, depth = 0): string {
    if (!Array.isArray(chain)) {
      throw new InvalidArgumentError('input chain is not an array');
    }

    const level = depth % 2;
    if (level === 0) {
      return this.renderOr(chain, depth);
    } else {
      return this.renderAnd(chain, depth);
    }
  }

  renderAnd(chain: InputChain, depth: number): string {
    const joiner = this.joiners[depth % this.joiners.length];
    return chain.map((it) => {
      if (typeof it === 'string') {
        return it;
      } else {
        return this.render(it, depth + 1);
      }
    }).join(joiner);
  }

  renderOr(chain: InputChain, depth: number): string {
    const index = this.random.nextInt(chain.length);
    const item = chain[index];

    if (typeof item === 'string') {
      return item;
    } else {
      return this.render(item, depth + 1);
    }
  }
}