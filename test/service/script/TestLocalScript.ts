import { expect } from 'chai';
import { Container, NullLogger } from 'noicejs';
import { spy } from 'sinon';

import { Item } from '../../../src/model/entity/Item';
import { WorldState } from '../../../src/model/world/State';
import { CoreModule } from '../../../src/module/CoreModule';
import { MathRandomGenerator } from '../../../src/service/random/MathRandom';
import { LocalScriptService } from '../../../src/service/script/LocalScript';
import { StateEntityTransfer } from '../../../src/util/state/EntityTransfer';
import { getStubHelper } from '../../helper';

const TEST_STATE: WorldState = {
  meta: {
    desc: '',
    id: '',
    name: '',
    template: '',
  },
  rooms: [],
  start: {
    room: '',
  },
  step: {
    time: 0,
    turn: 0,
  },
  world: {
    depth: 0,
    id: '',
    seed: '',
  },
};

describe('local script service', () => {
  it('should invoke the script with target', async () => {
    const container = Container.from(new CoreModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const target: Item = {
      type: 'item',
      meta: {
        desc: '',
        id: '',
        name: '',
        template: '',
      },
      slots: new Map(),
      stats: new Map(),
      verbs: new Map(),
    };

    const script = await container.create(LocalScriptService, {}, new Map());
    await script.invoke(target, 'foo', {
      data: new Map(),
      random: await container.create(MathRandomGenerator),
      state: TEST_STATE,
      stateHelper: getStubHelper(),
      transfer: await container.create(StateEntityTransfer),
    });
  });

  it('should gracefully handle unknown scripts', async () => {
    const container = Container.from(new CoreModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const target: Item = {
      type: 'item',
      meta: {
        desc: '',
        id: '',
        name: '',
        template: '',
      },
      slots: new Map([
        ['foo', 'none'],
      ]),
      stats: new Map(),
      verbs: new Map(),
    };

    const script = await container.create(LocalScriptService, {}, new Map());
    await script.invoke(target, 'foo', {
      data: new Map(),
      random: await container.create(MathRandomGenerator),
      state: TEST_STATE,
      stateHelper: getStubHelper(),
      transfer: await container.create(StateEntityTransfer),
    });
  });

  it('should invoke scripts with entity', async () => {
    const container = Container.from(new CoreModule());
    await container.configure({
      logger: NullLogger.global,
    });

    const target: Item = {
      type: 'item',
      meta: {
        desc: '',
        id: '',
        name: '',
        template: '',
      },
      slots: new Map([
        ['foo', 'bar'],
      ]),
      stats: new Map(),
      verbs: new Map(),
    };

    const scriptSpy = spy();
    const script = await container.create(LocalScriptService, {}, new Map([
      ['bar', scriptSpy],
    ]));
    await script.invoke(target, 'foo', {
      data: new Map(),
      random: await container.create(MathRandomGenerator),
      state: TEST_STATE,
      stateHelper: getStubHelper(),
      transfer: await container.create(StateEntityTransfer),
    });

    expect(scriptSpy).to.have.callCount(1);
  });

  xit('should gracefully handle undefined slots');
  xit('should broadcast events to matching entities');
});
