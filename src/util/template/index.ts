import { mustFind } from '@apextoaster/js-utils';
import { BaseEntity, Template, TemplateNumber, TemplatePrimitive, TemplateString } from '../../model/meta/Template';
import { VerbMap, VerbSlot } from '../types';

export function renderString(input: TemplateString) {
  return input.base;
}

export function renderNumber(input: TemplateNumber) {
  return input.min;
}

export function renderNumberMap(input: Map<string, TemplateNumber>): Map<string, number> {
  const result = new Map();

  for (const [key, value] of input) {
    result.set(key, renderNumber(value));
  }

  return result;
}

export function renderStringMap(input: Map<string, TemplateString>): Map<string, string> {
  const result = new Map();

  for (const [key, value] of input) {
    result.set(key, renderString(value));
  }

  return result;
}

export function renderVerbMap(input: TemplatePrimitive<VerbMap>): VerbMap {
  const result = new Map();

  for (const [key, value] of input) {
    const verb: VerbSlot = {
      slot: value.slot.base,
      data: {},
    };

    result.set(key, verb);
  }

  return result;
}

// TODO: export function renderNumberList(input: Array<TemplateNumber>): Array<number>;
// TODO: export function renderStringList(input: Array<TemplateString>): Array<string>;

export function findByBaseId<T extends BaseEntity>(templates: Array<Template<T>>, id: string): Template<T> {
  return mustFind(templates, (it) => it.base.meta.id.base === id);
}
