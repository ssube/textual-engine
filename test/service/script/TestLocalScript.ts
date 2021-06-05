import { expect } from 'chai';
import { spy } from 'sinon';

import { Item } from '../../../src/model/entity/Item';
import { CoreModule } from '../../../src/module/CoreModule';
import { MathRandomGenerator } from '../../../src/service/random/MathRandom';
import { LocalScriptService } from '../../../src/service/script/LocalScript';
import { StateEntityTransfer } from '../../../src/util/state/EntityTransfer';
import { makeTestItem } from '../../entity';
import { getStubHelper, getTestContainer } from '../../helper';

describe('local script service', () => {
  it('should gracefully skip unknown scripts', async () => {
    const container = await getTestContainer(new CoreModule());

    const target: Item = makeTestItem('', '', '');
    target.scripts.set('foo', {
      data: new Map(),
      name: 'none',
    });

    const script = await container.create(LocalScriptService, {}, new Map());
    await script.invoke(target, 'foo', {
      data: new Map(),
      random: await container.create(MathRandomGenerator),
      state: getStubHelper(),
      transfer: await container.create(StateEntityTransfer),
    });
  });

  it('should invoke scripts with target', async () => {
    const container = await getTestContainer(new CoreModule());

    const target: Item = makeTestItem('', '', '');
    target.scripts.set('verbs.foo', {
      data: new Map(),
      name: 'bar',
    });

    const scriptSpy = spy();
    const script = await container.create(LocalScriptService, {}, new Map([
      ['bar', scriptSpy],
    ]));
    await script.invoke(target, 'verbs.foo', {
      data: new Map(),
      item: target,
      random: await container.create(MathRandomGenerator),
      state: getStubHelper(),
      transfer: await container.create(StateEntityTransfer),
    });

    expect(scriptSpy).to.have.callCount(1);
  });

  it('should gracefully handle undefined scripts', async () => {
    const container = await getTestContainer(new CoreModule());

    const target: Item = makeTestItem('', '', '');
    target.scripts.set('verbs.foo', {
      data: new Map(),
      name: 'bar',
    });

    const scriptSpy = spy();
    const script = await container.create(LocalScriptService, {}, new Map([
      ['bar', scriptSpy],
    ]));
    await script.invoke(target, 'verbs.bar', {
      data: new Map(),
      random: await container.create(MathRandomGenerator),
      state: getStubHelper(),
      transfer: await container.create(StateEntityTransfer),
    });

    expect(scriptSpy).to.have.callCount(0);
  });

  xit('should broadcast events to matching entities');
});
