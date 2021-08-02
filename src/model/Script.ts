import { Immutable } from '../util/types.js';

export type ScriptData = Map<string, number | string>;

export interface ScriptRef {
  data: ScriptData;
  name: string;
}

export type ScriptMap = Map<string, ScriptRef>;

export type ImmutableScriptMap = Map<string, Immutable<ScriptRef>>;
