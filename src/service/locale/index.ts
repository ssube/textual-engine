import { LocaleBundle, LocaleContext } from '../../model/file/Locale';

export interface LocaleService {
  start(): Promise<void>;

  addBundle(name: string, bundle: LocaleBundle): void;
  deleteBundle(name: string): void;

  getKey(key: string, context: LocaleContext): string;
}
