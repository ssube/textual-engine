import { mustFind } from '@apextoaster/js-utils';

import { Entity } from '../../model/entity/Base.js';
import { Template } from '../../model/mapped/Template.js';

export type InputChain = Array<string | InputChain>;

export function findByBaseId<TEntity extends Entity>(templates: Array<Template<TEntity>>, id: string): Template<TEntity> {
  return mustFind(templates, (it) => it.base.meta.id === id);
}
