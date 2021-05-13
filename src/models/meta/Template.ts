import { Modifier } from './Modifier';

export interface TemplateNumber {
  type: 'number';
  max: number;
  min: number;
}

export interface TemplateString {
  type: 'string'
  base: string;
}

export type TemplatePrimitive<T> =
  T extends number ? TemplateNumber :
  T extends string ? TemplateString :
  T extends Array<infer V> ? Array<Template<V>> :
  T extends Map<infer K, infer V> ? Map<K, BaseTemplate<V>> :
  T extends object ? BaseTemplate<T> :
  never;

export type BaseTemplate<T> = {
  [K in keyof T]: TemplatePrimitive<T[K]>;
};

export type Template<T> = {
  base: BaseTemplate<T>;
  mods: Array<Modifier>;
};
