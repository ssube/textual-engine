import { mustFind } from '@apextoaster/js-utils';

import { Entity } from '../../model/entity/Base';
import { Template } from '../../model/meta/Template';

export type InputChain = Array<string | InputChain>;

export function findByTemplateId<TEntity extends Entity>(templates: Array<Template<TEntity>>, id: string): Template<TEntity> {
  return mustFind(templates, (it) => it.base.meta.id === id);
}
