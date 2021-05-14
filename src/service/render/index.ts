export interface Render {
  read(prompt: string): Promise<string>;
  show(msg: string): Promise<void>;
  showSync(msg: string): void;
  stop(): Promise<void>;
}