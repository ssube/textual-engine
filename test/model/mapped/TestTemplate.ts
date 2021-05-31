import Ajv from 'ajv';
import { expect } from 'chai';

import { TEMPLATE_NUMBER_SCHEMA, TEMPLATE_REF_SCHEMA, TEMPLATE_STRING_SCHEMA } from '../../../src/model/mapped/Template';

describe('template mapped model', () => {
  it('should validate template numbers', async () => {
    const schema = new Ajv().compile(TEMPLATE_NUMBER_SCHEMA);

    expect(schema({})).to.equal(false);
    expect(schema({
      min: 1,
      max: 1,
      step: 1,
    })).to.equal(true);
  });

  it('should validate template strings', async () => {
    const schema = new Ajv().compile(TEMPLATE_STRING_SCHEMA);

    expect(schema({})).to.equal(false);
    expect(schema({
      base: 3,
    })).to.equal(false);
    expect(schema({
      base: 'foo',
      max: 1,
      step: 1,
    })).to.equal(true);
  });

  it('should validate template refs', async () => {
    const schema = new Ajv({
      useDefaults: true,
    }).compile(TEMPLATE_REF_SCHEMA);

    expect(schema({})).to.equal(false);
    expect(schema({
      id: 'foo',
    })).to.equal(true);
  });

  it('should add a default chance to template refs', async () => {
    const schema = new Ajv({
      useDefaults: true,
    }).compile(TEMPLATE_REF_SCHEMA);

    const data = {
      id: 'foo',
    };
    expect(schema(data), 'must validate').to.equal(true);
    expect(data).to.have.ownProperty('chance');
  });
});
