import { State } from '../../model/State';

export interface CreateParams {
  /**
   * The number of rooms to pregenerate.
   */
  depth: number;

  id: string;

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
  create(params: CreateParams): Promise<void>;

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
   */
  start(): Promise<void>;

  stop(): Promise<void>;

  /**
   * Step the internal world state, simulating some turns and time passing.
   */
  step(params: StepParams): Promise<StepResult>;
}
