export interface Render {
  read(prompt: string): Promise<string>;
  show(msg: string): Promise<void>;
  stop(): Promise<void>;
}