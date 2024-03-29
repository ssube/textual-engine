import { expect } from 'chai';

import { Item } from '../../../src/model/entity/Item.js';
import { CoreModule } from '../../../src/module/CoreModule.js';
import { LocalScriptService } from '../../../src/service/script/LocalScript.js';
import { makeTestItem } from '../../entity.js';
import { createTestContext, getStubHelper, getTestContainer, SinonStub, spy, stub } from '../../helper.js';

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

    // TODO: make assertions
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

  it('should gracefully handle unknown scripts', async () => {
    const container = await getTestContainer(new CoreModule());

    const target: Item = makeTestItem('', '', '');
    target.scripts.set('verbs.foo', {
      data: new Map(),
      name: 'foo',
    });

    const scriptSpy = spy();
    const script = await container.create(LocalScriptService, {}, new Map([
      ['bar', scriptSpy],
    ]));
    await script.invoke(target, 'verbs.foo', createTestContext({
      item: target,
    }));

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
    (state.find as SinonStub).resolves(results);

    await script.broadcast(target, 'verbs.bar', createTestContext({
      script,
      state,
    }));

    expect(invokeStub).to.have.callCount(results.length);
  });

  it('should contain errors thrown by invoked scripts', async () => {
    const container = await getTestContainer(new CoreModule());

    const target: Item = makeTestItem('', '', '');
    target.scripts.set('verbs.foo', {
      data: new Map(),
      name: 'foo',
    });

    const scriptStub = stub().throws(new Error('script broke'));
    const script = await container.create(LocalScriptService, {}, new Map([
      ['foo', scriptStub],
    ]));

    await script.invoke(target, 'verbs.foo', createTestContext({
      item: target,
    }));

    expect(scriptStub).to.have.callCount(1);
  });

  it('should contain non-errors thrown by invoked scripts', async () => {
    const container = await getTestContainer(new CoreModule());

    const target: Item = makeTestItem('', '', '');
    target.scripts.set('verbs.foo', {
      data: new Map(),
      name: 'foo',
    });

    const scriptStub = spy(() => {
      throw 'script broke'; // stub.throws auto-wraps in an Error, which is undesirable here
    });
    const script = await container.create(LocalScriptService, {}, new Map([
      ['foo', scriptStub],
    ]));

    await script.invoke(target, 'verbs.foo', createTestContext({
      item: target,
    }));

    expect(scriptStub).to.have.callCount(1);
  });
});
