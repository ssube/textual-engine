import { Command } from '../../model/Command';
import { WorldEntity } from '../../model/entity';
import { Portal } from '../../model/entity/Portal';
import { LocaleBundle } from '../../model/file/Locale';

export type LocaleContext = Record<string, number | string | WorldEntity | Portal | Command>;

export interface LocaleService {
  start(): Promise<void>;

  addBundle(name: string, bundle: LocaleBundle): void;
  deleteBundle(name: string): void;

  translate(key: string, context?: LocaleContext): string;
}
