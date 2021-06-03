import { Service } from '..';
import { Command } from '../../model/Command';
import { WorldEntity } from '../../model/entity';
import { Portal } from '../../model/entity/Portal';
import { LocaleBundle } from '../../model/file/Locale';
import { Metadata } from '../../model/Metadata';

export type LocaleContext = Record<string, number | string | WorldEntity | Portal | Command | Metadata>;

export interface LocaleService extends Service {
  addBundle(name: string, bundle: LocaleBundle): void;
  deleteBundle(name: string): void;

  translate(key: string, context?: LocaleContext): string;
}
