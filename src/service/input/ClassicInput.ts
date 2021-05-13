import { Command, Input } from ".";

export class ClassicInput implements Input {
  tokenize(input: string): Promise<string[]> {
    throw new Error("Method not implemented.");
  }
  parse(input: string): Promise<Command[]> {
    throw new Error("Method not implemented.");
  }
}