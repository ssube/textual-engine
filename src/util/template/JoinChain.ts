import { InputChain } from './index.js';
import { RandomService } from '../../service/random/index.js';

export interface JoinOptions {
  joiners: Array<string>;
  random: RandomService;
}

const LEVEL_EVEN_ODD = 2;

/**
 * A string building construct that:
 *
 * - takes a nested list of input fragments
 * - takes a list of joiners
 * - for each fragment of the input chain:
 *   - modulo select a joiner
 *   - select one or more items using level operator
 *     - recurse into child chains
 *   - join items with level joiner
 */
export class JoinChain {
  protected joiners: Array<string>;
  protected random: RandomService;

  constructor(options: JoinOptions) {
    this.joiners = options.joiners;
    this.random = options.random;
  }

  public render(chain: InputChain, depth = 0): string {
    const level = depth % LEVEL_EVEN_ODD;
    if (level === 0) {
      return this.renderAnd(chain, depth);
    } else {
      return this.renderOr(chain, depth);
    }
  }

  public renderAnd(chain: InputChain, depth: number): string {
    const joiner = this.joiners[depth % this.joiners.length];
    return chain.map((it) => {
      if (typeof it === 'string') {
        return it;
      } else {
        return this.render(it, depth + 1);
      }
    }).join(joiner);
  }

  public renderOr(chain: InputChain, depth: number): string {
    const index = this.random.nextInt(chain.length);
    const item = chain[index];

    if (typeof item === 'string') {
      return item;
    } else {
      return this.render(item, depth + 1);
    }
  }
}
