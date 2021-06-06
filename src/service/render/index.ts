export interface RenderService {
  /**
   * Set the default prompt for future reads.
   */
  setPrompt(prompt: string): void;

  /**
   * Wait for the next line of input.
   */
  read(): Promise<string>;

  /**
   * Buffer and show a line of output.
   */
  show(msg: string): void;

  /**
   * Start the rendering system and start accepting input.
   *
   * This does not get the first line of input, that must still be `read()`.
   */
  start(): Promise<void>;

  /**
   * Shut down the rendering subsystem and release resources, unmount elements, and stop accepting input.
   */
  stop(): Promise<void>;

  update(): void;
}
