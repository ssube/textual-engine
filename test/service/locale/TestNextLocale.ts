import { NotFoundError } from '@apextoaster/js-utils';
import { expect } from 'chai';

import { CoreModule } from '../../../src/module/CoreModule.js';
import { NextLocaleService } from '../../../src/service/locale/NextLocale.js';
import { getTestContainer } from '../../helper.js';

describe('next locale service', () => {
  it('should have an i18next instance after being started', async () => {
    const container = await getTestContainer(new CoreModule());
    const locale = await container.create(NextLocaleService);

    expect(() => locale.getInstance()).to.throw(NotFoundError);

    await locale.start();

    expect(locale.getInstance()).not.to.equal(undefined);
  });

  it('should prefer the world bundle', async () => {
    const container = await getTestContainer(new CoreModule());
    const locale = await container.create(NextLocaleService);
    await locale.start();

    locale.addBundle('common', {
      languages: {
        en: {
          articles: [],
          prepositions: [],
          strings: {
            foo: 'bar',
          },
          verbs: [],
        },
      },
    });
    locale.addBundle('world', {
      languages: {
        en: {
          articles: [],
          prepositions: [],
          strings: {
            foo: 'bin',
          },
          verbs: [],
        },
      },
    });

    expect(locale.translate('foo')).to.equal('bin');
  });

  it('should translate keys with context', async () => {
    const container = await getTestContainer(new CoreModule());
    const locale = await container.create(NextLocaleService);
    await locale.start();

    locale.addBundle('common', {
      languages: {
        en: {
          articles: [],
          prepositions: [],
          strings: {
            foo: '{{size}} bar',
          },
          verbs: [],
        },
      },
    });

    expect(locale.translate('foo', { size: 4 })).to.equal('4 bar');
  });

  it('should remove language bundles', async () => {
    const container = await getTestContainer(new CoreModule());
    const locale = await container.create(NextLocaleService);
    await locale.start();

    locale.addBundle('common', {
      languages: {
        en: {
          articles: [],
          prepositions: [],
          strings: {
            foo: '{{size}} bar',
          },
          verbs: [],
        },
      },
    });
    locale.deleteBundle('common');

    expect(locale.translate('foo', { size: 4 })).to.equal('foo');
  });

  xit('should add bundles from events');
});
