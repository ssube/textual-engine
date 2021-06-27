import { doesExist, mustExist } from '@apextoaster/js-utils';
import i18next, { i18n } from 'i18next';
import { Inject, Logger } from 'noicejs';

import { LocaleContext, LocaleService } from '.';
import { ConfigFile } from '../../model/file/Config';
import { LocaleBundle } from '../../model/file/Locale';
import { INJECT_CONFIG, INJECT_EVENT, INJECT_LOGGER, InjectedOptions } from '../../module';
import { makeServiceLogger } from '../../util/service';
import { EventBus } from '../event';

@Inject(INJECT_CONFIG, INJECT_EVENT, INJECT_LOGGER)
export class NextLocaleService implements LocaleService {
  protected config: ConfigFile['locale'];
  protected event: EventBus;
  protected logger: Logger;

  protected i18next?: i18n;
  protected bundleLangs: Map<string, Set<string>>;

  constructor(options: InjectedOptions) {
    this.config = mustExist(options[INJECT_CONFIG]).locale;
    this.event = mustExist(options[INJECT_EVENT]);
    this.logger = makeServiceLogger(options[INJECT_LOGGER], this);

    this.bundleLangs = new Map();
  }

  public async start(): Promise<void> {
    const inst = i18next.createInstance({
      defaultNS: 'world',
      fallbackNS: ['common'],
      lng: this.config.current,
    });
    await inst.init();

    this.i18next = inst;
  }

  public async stop(): Promise<void> {
    this.event.removeGroup(this);
    this.i18next = undefined;
  }

  public addBundle(name: string, bundle: LocaleBundle): void {
    const langs = new Set<string>();
    for (const lng of Object.keys(bundle.languages)) {
      const data = bundle.languages[lng];
      this.getInstance().addResourceBundle(lng, name, data.strings);
      langs.add(lng);
    }

    this.logger.debug({
      bundleName: name,
      langs: Array.from(langs),
    }, 'added locale bundle');

    this.bundleLangs.set(name, langs);
  }

  public deleteBundle(name: string): void {
    const langs = this.bundleLangs.get(name);
    if (doesExist(langs)) {
      for (const lng of langs) {
        this.getInstance().removeResourceBundle(lng, name);
      }
      this.bundleLangs.delete(name);
    }
  }

  public translate(key: string, scope?: LocaleContext): string {
    return this.getInstance().t(key, scope);
  }

  public getInstance(): i18n {
    return mustExist(this.i18next);
  }

  public getLocale(): string {
    return mustExist(this.config.current);
  }
}
