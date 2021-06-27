import { i18n } from 'i18next';
import { Service } from '..';
import { Command } from '../../model/Command';
import { WorldEntity } from '../../model/entity';
import { Portal } from '../../model/entity/Portal';
import { LocaleBundle } from '../../model/file/Locale';
import { Metadata } from '../../model/Metadata';

export type LocaleContext = Record<string, number | string | WorldEntity | Portal | Command | Metadata>;

/**
 * Localization and translation service.
 */
export interface LocaleService extends Service {
  /**
   * Add a named translation bundle for one or more languages.
   *
   * Bundles should be added through the load event, rather than calling this directly.
   */
  addBundle(name: string, bundle: LocaleBundle): void;

  /**
   * Delete a translation bundle for all languages.
   */
  deleteBundle(name: string): void;

  /**
   * Expose the underlying instance for React.
   *
   * @todo look into passing the entire service as context
   */
  getInstance(): i18n;

  getLocale(): string;

  /**
   * Translate a string with one or more keys, using the given context.
   */
  translate(key: string, context?: LocaleContext): string;
}
