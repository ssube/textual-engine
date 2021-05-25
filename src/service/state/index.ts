import { State } from '../../model/State';
import { World } from '../../model/World';

export interface CreateParams {
  /**
   * The number of rooms to pregenerate.
   */
  depth: number;

  /**
   * The PRNG seed to use for this world.
   */
  seed: string;
}

export interface StepParams {
  time: number;
}

export interface StepResult {
  /**
   * The end time for this step (caller provided a start time and can do deltas).
   */
  time: number;

  /**
   * The index of this step.
   */
  turn: number;
}

export interface StateService {
  /**
   * Create a new world state from a world template.
   */
  create(world: World, params: CreateParams): Promise<State>;

  /**
   * Load an existing world state.
   */
  load(state: State): Promise<void>;

  /**
   * Save the current world state.
   */
  save(): Promise<State>;

  /**
   * Begin the game loop, continuing until a quit command is received.
   *
   * @todo should this return the final state/step?
   */
  loop(): Promise<void>;

  /**
   * Step the internal world state, simulating some turns and time passing.
   */
  step(params: StepParams): Promise<StepResult>;
}
