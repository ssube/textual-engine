import { constructorName, doesExist, mustExist } from '@apextoaster/js-utils';
import i18next, { i18n } from 'i18next';
import { BaseOptions, Inject, Logger } from 'noicejs';

import { LocaleContext, LocaleService } from '.';
import { ConfigFile } from '../../model/file/Config';
import { LocaleBundle } from '../../model/file/Locale';
import { INJECT_CONFIG, INJECT_EVENT, INJECT_LOGGER } from '../../module';
import { EventBus } from '../event';

interface NextLocaleOptions extends BaseOptions {
  [INJECT_CONFIG]?: ConfigFile;
  [INJECT_EVENT]?: EventBus;
  [INJECT_LOGGER]?: Logger;
}

@Inject(INJECT_CONFIG, INJECT_EVENT, INJECT_LOGGER)
export class NextLocaleService implements LocaleService {
  protected config: ConfigFile['locale'];
  protected event: EventBus;
  protected logger: Logger;

  protected i18next?: i18n;
  protected bundleLangs: Map<string, Set<string>>;

  constructor(options: NextLocaleOptions) {
    this.config = mustExist(options[INJECT_CONFIG]).locale;
    this.event = mustExist(options[INJECT_EVENT]);
    this.logger = mustExist(options[INJECT_LOGGER]).child({
      kind: constructorName(this),
    });

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

    this.event.on('locale-bundle', (event) => {
      this.deleteBundle(event.name);
      this.addBundle(event.name, event.bundle);
    });
  }

  public addBundle(name: string, bundle: LocaleBundle): void {
    const langs = new Set<string>();
    for (const lng of Object.keys(bundle.bundles)) {
      const data = bundle.bundles[lng];
      this.getInstance().addResourceBundle(lng, name, data);
      langs.add(lng);
    }

    this.logger.debug({
      bundleName: name,
      langs,
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
}
