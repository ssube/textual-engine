import { InvalidArgumentError } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { Container, NullLogger } from 'noicejs';

import { TemplateNumber, TemplateString } from '../../../src/model/meta/Template';
import { LocalModule } from '../../../src/module/LocalModule';
import { ChainTemplateService } from '../../../src/service/template/ChainTemplateService';

const DEFAULT_NUMBER: TemplateNumber = {
  min: 0,
  max: 10,
  step: 1,
  type: 'number',
};

const DEFAULT_STRING: TemplateString = {
  base: '(foo|bar)',
  type: 'string',
};

describe('chain template service', () => {
  describe('modify number', () => {
    it('should increment the value', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const template = await container.create(ChainTemplateService);
      expect(template.modifyNumber(0, {
        offset: 5,
      })).to.equal(5);
    });

    it('should increment the value with negative modifiers', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const template = await container.create(ChainTemplateService);
      expect(template.modifyNumber(0, {
        offset: -5,
      })).to.equal(-5);
    });
  });

  describe('modify string', () => {
    xit('should prepend the prefix', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const template = await container.create(ChainTemplateService);
      expect(template.modifyString('foo', {
        prefix: 'bar',
        suffix: '',
      })).to.equal('bar foo');
    });

    it('should append the suffix', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const template = await container.create(ChainTemplateService);
      expect(template.modifyString('foo', {
        prefix: '',
        suffix: 'bar',
      })).to.equal('foo bar');
    });
  });

  describe('modify number lists', () => { });
  describe('modify string lists', () => { });

  describe('modify number maps', () => {
    it('should modify keys that exist in the modifier', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const template = await container.create(ChainTemplateService);
      const result = template.modifyNumberMap(new Map([
        ['foo', 1],
        ['bar', 3],
      ]), new Map([
        ['foo', {
          offset: 1,
        }],
        ['bar', {
          offset: -1,
        }],
      ]));

      expect(result.size, 'result size').to.equal(2); // input size, no added keys
      expect(result.get('foo'), 'result foo value').to.equal(2);
      expect(result.get('bar'), 'result bar value').to.equal(2);
    });

    it('should not modify keys that do not exist in the modifier', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const template = await container.create(ChainTemplateService);
      const result = template.modifyNumberMap(new Map([
        ['foo', 1],
        ['bar', 3],
      ]), new Map([
        ['bin', {
          offset: 1,
        }],
        ['bun', {
          offset: -1,
        }],
      ]));

      expect(result.size, 'result size').to.equal(2); // input size, no added keys
    });
  });

  describe('modify string maps', () => {
    it('should modify keys that exist in the modifier', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const template = await container.create(ChainTemplateService);
      const result = template.modifyStringMap(new Map([
        ['foo', 'hello'],
        ['bar', 'world'],
      ]), new Map([
        ['foo', {
          prefix: 'fin',
          suffix: 'fan',
        }],
        ['bar', {
          prefix: 'bin',
          suffix: 'ban',
        }],
      ]));

      expect(result.size, 'result size').to.equal(2); // input size, no added keys
      expect(result.get('foo'), 'result foo value').to.equal('fin hello fan');
      expect(result.get('bar'), 'result bar value').to.equal('bin world ban');
    });

    it('should not modify keys that do not exist in the modifier', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const template = await container.create(ChainTemplateService);
      const result = template.modifyStringMap(new Map([
        ['foo', 'hello'],
        ['bar', 'world'],
      ]), new Map([
        ['bin', {
          prefix: 'fix',
          suffix: 'fix',
        }],
        ['bun', {
          prefix: 'fox',
          suffix: 'fox',
        }],
      ]));

      expect(result.size, 'result size').to.equal(2); // input size, no added keys
    });
  });

  describe('render template number', () => {
    it('should render numbers', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const template = await container.create(ChainTemplateService);
      expect(template.renderNumber(DEFAULT_NUMBER)).to.be.greaterThan(DEFAULT_NUMBER.min).and.lessThan(DEFAULT_NUMBER.max);
    });

    it('should render numbers with step < 1', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const template = await container.create(ChainTemplateService);

      const value = template.renderNumber({
        ...DEFAULT_NUMBER,
        step: 0.1,
      });
      expect(value).to.be.greaterThan(DEFAULT_NUMBER.min).and.lessThan(DEFAULT_NUMBER.max);
      expect(Math.floor(value)).to.not.equal(value);
    });

    it('should throw if step is < 0', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const template = await container.create(ChainTemplateService);
      expect(() => template.renderNumber({
        ...DEFAULT_NUMBER,
        step: -1,
      })).to.throw(InvalidArgumentError);
    });
  });

  describe('render template string', () => {
    it('should render strings', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const template = await container.create(ChainTemplateService);
      expect(template.renderString(DEFAULT_STRING)).to.equal('foo bar'); // first level is AND
    });
  });

  describe('render template list', () => {
    it('should render many numbers', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const template = await container.create(ChainTemplateService);

      expect(template.renderNumberList([{
        min: 0,
        max: 10,
        step: 0.1,
        type: 'number',
      }])).to.deep.equal([
        0.8,
      ]);
    });

    it('should render many strings', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const template = await container.create(ChainTemplateService);

      expect(template.renderStringList([{
        base: 'foo',
        type: 'string',
      }])).to.deep.equal([
        'foo',
      ]);
    });

    xit('should render mixed-type lists');
  });

  describe('render template maps', () => {
    it('should render many number values', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const template = await container.create(ChainTemplateService);
      const map = new Map<string, TemplateNumber>([
        ['foo', DEFAULT_NUMBER],
        ['bar', DEFAULT_NUMBER],
      ]);

      const rendered = template.renderNumberMap(map);
      expect(rendered.size).to.equal(2);
    });

    it('should render many string values', async () => {
      const container = Container.from(new LocalModule());
      await container.configure({
        logger: NullLogger.global,
      });

      const template = await container.create(ChainTemplateService);
      const map = new Map<string, TemplateString>([
        ['foo', DEFAULT_STRING],
        ['bar', DEFAULT_STRING],
      ]);

      const rendered = template.renderStringMap(map);
      expect(rendered.size).to.equal(2);
    });

    xit('should render mixed-type maps');
    xit('should render template verb maps');
  });
});