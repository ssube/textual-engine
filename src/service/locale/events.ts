import { LocaleBundle } from '../../model/file/Locale.js';

/**
 * Event when a locale bundle should be added for use.
 */
export interface LocaleBundleEvent {
  bundle: LocaleBundle;
  name: string;
}
