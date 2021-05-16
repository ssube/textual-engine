import { State } from '../../model/State';
import { World } from '../../model/World';

export interface CreateParams {
  /**
   * The number of rooms to pregenerate.
   */
  rooms: number;

  /**
   * The PRNG seed to use for this world.
   */
  seed: string;
}

export interface StateController {
  /**
   * Create a new world state from a world template.
   */
  from(world: World, params: CreateParams): Promise<State>;

  /**
   * Load an existing world state.
   */
  load(state: State): Promise<void>;

  /**
   * Save the current world state.
   */
  save(): Promise<State>;

  /**
   * Step the internal world state, simulating some turns and time passing.
   */
  step(time: number): Promise<Array<string>>;

  // TODO: get last step output buffer method
}
