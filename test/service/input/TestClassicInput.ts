import { expect } from 'chai';
import { Container } from 'noicejs';

import { LocalModule } from '../../../src/module/LocalModule';
import { ClassicInput } from '../../../src/service/input/ClassicInput';

describe('classic input', () => {
  it('should parse input lines', async () => {
    const container = Container.from(new LocalModule());
    await container.configure();

    const input = await container.create(ClassicInput);

    return expect(input.parse('foo')).to.eventually.deep.equal({
      index: 0,
      input: 'foo',
      target: '',
      verb: 'foo',
    });
  });

  it('should parse a final numeric segment as the command index', async () => {
    const container = Container.from(new LocalModule());
    await container.configure();

    const input = await container.create(ClassicInput);

    const index = 13;
    const line = `foo bar ${index}`;
    return expect(input.parse(line)).to.eventually.deep.equal({
      index,
      input: line,
      target: 'bar',
      verb: 'foo',
    });
  });

  it('should save the last parsed command', async () => {
    const container = Container.from(new LocalModule());
    await container.configure();

    const input = await container.create(ClassicInput);

    const index = 13;
    const line = `foo bar ${index}`;

    const cmd = await input.parse(line);
    return expect(input.last()).to.eventually.deep.equal(cmd);
  });

  xit('should translate and cache verbs');
});
