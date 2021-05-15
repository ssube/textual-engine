import { Entity } from '../entity/Base';
import { Metadata } from './Metadata';

export interface TemplateNumber {
  type: 'number';
  max: number;
  min: number;
}

export interface TemplateString {
  type: 'string'
  base: string;
}

export interface TemplateRef {
  type: 'id';
  id: string;
}

export type TemplatePrimitive<T> =
  T extends number ? TemplateNumber :                               // number -> range
  T extends string ? TemplateString :                               // string -> template
  T extends Metadata ? BaseTemplate<Omit<Metadata, 'template'>> :   // Metadata + template -> Metadata
  T extends Entity ? TemplateRef :                                  // entity -> id
  T extends Array<Entity> ? Array<TemplateRef> :                    // Array<entity> -> Array<id>
  T extends Array<infer V> ? Array<TemplatePrimitive<V>> :          // Array<V> -> Array<Template<V>>
  T extends Map<infer K, infer V> ? Map<K, TemplatePrimitive<V>> :  // Map<K, V> -> Map<K, Template<V>>
  T extends object ? BaseTemplate<T> :                              // {[K]: V] -> {[K]: Template<V>}
  never;

export type BaseTemplate<T> = {
  [K in keyof T]: TemplatePrimitive<T[K]>;
};

export type Template<T> = {
  base: BaseTemplate<T>;
  // mods: Array<Modifier>;
};
