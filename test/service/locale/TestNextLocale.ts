import { NotFoundError } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { Container, NullLogger } from 'noicejs';

import { LocalModule } from '../../../src/module/LocalModule';
import { NextLocaleService } from '../../../src/service/locale/NextLocale';

describe('next locale service', () => {
  it('should have an i18next instance after being started', async () => {
    const container = Container.from(new LocalModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const locale = await container.create(NextLocaleService);

    expect(() => locale.getInstance()).to.throw(NotFoundError);

    await locale.start();

    expect(locale.getInstance()).not.to.equal(undefined);
  });

  it('should prefer the world bundle', async () => {
    const container = Container.from(new LocalModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const locale = await container.create(NextLocaleService);
    await locale.start();

    locale.addBundle('common', {
      bundles: {
        en: {
          foo: 'bar',
        },
      },
    });
    locale.addBundle('world', {
      bundles: {
        en: {
          foo: 'bin',
        },
      },
    });

    expect(locale.translate('foo')).to.equal('bin');
  });

  it('should translate keys with context', async () => {
    const container = Container.from(new LocalModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const locale = await container.create(NextLocaleService);
    await locale.start();

    locale.addBundle('common', {
      bundles: {
        en: {
          foo: '{{size}} bar',
        },
      },
    });

    expect(locale.translate('foo', { size: 4 })).to.equal('4 bar');
  });

  xit('should remove language bundles');
});
