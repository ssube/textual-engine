import { ScriptScope, ScriptTarget } from '..';

export async function ItemStep(this: ScriptTarget, scope: ScriptScope): Promise<void> {
  console.log('step script', this.meta.id, Object.keys(scope));

  if (this.type === 'item') {
    console.log(`item has ${this.slots.size} verbs`);
  }
}
