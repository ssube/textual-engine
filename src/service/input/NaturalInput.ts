import { Command, Input } from ".";

export class NaturalInput implements Input {
  last(): Promise<Command[]> {
    throw new Error("Method not implemented.");
  }
  tokenize(input: string): Promise<string[]> {
    throw new Error("Method not implemented.");
  }
  parse(input: string): Promise<Command[]> {
    throw new Error("Method not implemented.");
  }
}