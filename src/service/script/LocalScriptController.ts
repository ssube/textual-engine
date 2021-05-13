import { ScriptController, ScriptScope, ScriptTarget } from '.';

export class LocalScriptController implements ScriptController {
  async invoke(target: ScriptTarget, slot: string, scope: ScriptScope): Promise<void> {
    console.log('invoke script', target, slot, scope);
  }
}