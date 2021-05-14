export interface Loader {
  load(path: string): Promise<Buffer>;
  save(path: string, data: Buffer): Promise<void>;

  loadStr(path: string): Promise<string>;
  saveStr(path: string, data: string): Promise<void>;
}