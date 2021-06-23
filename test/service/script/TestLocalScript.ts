import { expect } from 'chai';
import { SinonStub, spy, stub } from 'sinon';

import { Item } from '../../../src/model/entity/Item';
import { CoreModule } from '../../../src/module/CoreModule';
import { LocalScriptService } from '../../../src/service/script/LocalScript';
import { makeTestItem } from '../../entity';
import { createTestContext, getStubHelper, getTestContainer } from '../../helper';

describe('local script service', () => {
  it('should gracefully skip unknown scripts', async () => {
    const container = await getTestContainer(new CoreModule());

    const target: Item = makeTestItem('', '', '');
    target.scripts.set('foo', {
      data: new Map(),
      name: 'none',
    });

    const script = await container.create(LocalScriptService, {}, new Map());
    await script.invoke(target, 'foo', createTestContext());

    // TODO: assert something
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
    await script.invoke(target, 'verbs.foo', createTestContext({
      item: target,
    }));

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
    await script.invoke(target, 'verbs.bar', createTestContext());

    expect(scriptSpy).to.have.callCount(0);
  });

  it('should broadcast events to matching entities', async () => {
    const container = await getTestContainer(new CoreModule());

    const script = await container.create(LocalScriptService);
    const invokeStub = stub(script, 'invoke');

    const state = getStubHelper();
    const target = makeTestItem('', '', '');
    const results = [
      makeTestItem('', '', ''),
      makeTestItem('', '', ''),
      makeTestItem('', '', ''),
    ];
    (state.find as SinonStub).returns(Promise.resolve(results));

    await script.broadcast(target, 'verbs.bar', createTestContext({
      script,
      state,
    }));

    expect(invokeStub).to.have.callCount(results.length);
  });
});
