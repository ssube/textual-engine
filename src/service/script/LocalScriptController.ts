import { ScriptTarget, ScriptController } from ".";

export class LocalScriptController implements ScriptController {
  invoke(target: ScriptTarget, slot: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}