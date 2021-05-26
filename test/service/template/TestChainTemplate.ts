import { InvalidArgumentError } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { Container, NullLogger } from 'noicejs';

import { LocalModule } from '../../../src/module/LocalModule';
import { ChainTemplateService } from '../../../src/service/template/ChainTemplateService';

describe('chain template service', () => {
  it('should render template numbers', async () => {
    const container = Container.from(new LocalModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const template = await container.create(ChainTemplateService);

    const min = 0;
    const max = 15;
    expect(template.renderNumber({
      min,
      max,
      step: 1,
      type: 'number',
    })).to.be.greaterThan(min).and.lessThan(max);
  });

  it('should render template strings', async () => {
    const container = Container.from(new LocalModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const template = await container.create(ChainTemplateService);

    expect(template.renderString({
      base: '(foo|bar)',
      type: 'string',
    })).to.equal('foo bar'); // first level is AND
  });

  it('should render template numbers with step < 1', async () => {
    const container = Container.from(new LocalModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const template = await container.create(ChainTemplateService);

    const min = 0;
    const max = 15;
    const value = template.renderNumber({
      min: 0,
      max: 10,
      step: 0.1,
      type: 'number',
    });
    expect(value).to.be.greaterThan(min).and.lessThan(max);
    expect(Math.floor(value)).to.not.equal(value);
  });

  it('should throw if template number step is < 0', async () => {
    const container = Container.from(new LocalModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const template = await container.create(ChainTemplateService);
    expect(() => template.renderNumber({
      min: 0,
      max: 10,
      step: -1,
      type: 'number',
    })).to.throw(InvalidArgumentError);
  });

  xit('should render template number lists');
  xit('should render template string lists');
  xit('should render template mixed-type maps');
  xit('should render template number maps');
  xit('should render template string maps');
  xit('should render template verb maps');
});
