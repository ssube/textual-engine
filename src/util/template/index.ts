import { mustFind } from '@apextoaster/js-utils';

import { Entity } from '../../model/entity/Base';
import { Template } from '../../model/meta/Template';

export function findByTemplateId<T extends Entity>(templates: Array<Template<T>>, id: string): Template<T> {
  return mustFind(templates, (it) => it.base.meta.id.base === id);
}
