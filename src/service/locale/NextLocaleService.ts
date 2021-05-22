import { doesExist, mustExist } from '@apextoaster/js-utils';
import i18next, { i18n } from 'i18next';

import { LocaleService } from '.';
import { LocaleBundle, LocaleContext } from '../../model/file/Locale';

export class NextLocaleService implements LocaleService {
  protected i18next?: i18n;
  protected bundleLangs: Map<string, Set<string>>;

  constructor() {
    this.bundleLangs = new Map();
  }

  public async start(): Promise<void> {
    const inst = i18next.createInstance({
      defaultNS: 'world',
      fallbackNS: ['common'],
      lng: 'en',
    });
    await inst.init();

    this.i18next = inst;
  }

  public addBundle(name: string, bundle: LocaleBundle): void {
    const langs = new Set<string>();
    for (const lng of Object.keys(bundle.languages)) {
      const data = bundle.languages[lng];
      this.getInstance().addResourceBundle(lng, name, data);
      langs.add(lng);
    }

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

  public getKey(key: string, scope?: LocaleContext): string {
    return this.getInstance().t(key, scope);
  }

  public getInstance(): i18n {
    return mustExist(this.i18next);
  }
}
