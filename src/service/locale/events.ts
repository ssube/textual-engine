import { LocaleBundle } from '../../model/file/Locale';

export interface LocaleBundleEvent {
  bundle: LocaleBundle;
  name: string;
}
