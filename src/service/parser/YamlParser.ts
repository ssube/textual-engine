import { DataFile, Parser } from ".";

export class YamlParser implements Parser {
  load(data: string): DataFile {
    throw new Error("Method not implemented.");
  }
  
  save(data: DataFile): string {
    throw new Error("Method not implemented.");
  }
}