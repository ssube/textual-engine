export interface Render {
  /**
   * Wait for a line of input.
   */
  read(prompt: string): Promise<string>;

  /**
   * Write a message normally.
   */
  show(msg: string): Promise<void>;

  /**
   * Write a message without creating any async resources.
   */
  showSync(msg: string): void;

  /**
   * Start the rendering system and bind to the console.
   *
   * This does not get the first line of input, that must still be `read()`.
   */
  start(prompt: string): Promise<void>;

  /**
   * Shut down the rendering subsystem and unbind from the console.
   */
  stop(): Promise<void>;

  /**
   * Get an async iterable of lines (auto-prompt).
   */
  stream(): AsyncIterableIterator<string>;
}