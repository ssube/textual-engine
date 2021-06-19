import { StepResult } from '../service/state';
import { Filter, FilterKeys } from '../util/types';

// shared props used by multiple React renders

export const SHORTCUT_TABS = [{
  label: 'Actors',
  value: 'actors',
}, {
  label: 'Items',
  value: 'items',
}, {
  label: 'Portals',
  value: 'portals',
}, {
  label: 'Verbs',
  value: 'verbs',
}];

export interface FrameProps {
  onLine: (line: string) => void;
  output: Array<string>;
  prompt: string;
  quit: boolean;
  shortcuts: ShortcutData;
  show: {
    shortcuts: boolean;
    status: boolean;
  };
  stats: Array<StatusItem>;
  step: StepResult;
}

export interface InputProps {
  onChange: (line: string) => void;
  onLine: (line: string) => void;
  line: string;
  prompt: string;
}

export interface OutputProps {
  output: Array<string>;
}

export interface ShortcutItem {
  id: string;
  name: string;
}

export interface ShortcutProps {
  onSelect: (id: string) => void;
  actors: Array<ShortcutItem>;
  items: Array<ShortcutItem>;
  portals: Array<ShortcutItem>;
  verbs: Array<ShortcutItem>;
}

export type ShortcutData = Filter<ShortcutProps, Array<unknown>>;
export type ShortcutKeys = FilterKeys<ShortcutProps, Array<unknown>>;

export interface StatusItem {
  name: string;
  value: number;
}

export interface StatusProps {
  stats: Array<StatusItem>;
}
