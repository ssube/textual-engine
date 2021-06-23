import { NotImplementedError } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { BaseOptions } from 'noicejs';
import { match, stub } from 'sinon';

import { ACTOR_TYPE, ActorSource } from '../../../../src/model/entity/Actor';
import { ITEM_TYPE } from '../../../../src/model/entity/Item';
import { PORTAL_TYPE } from '../../../../src/model/entity/Portal';
import { ROOM_TYPE } from '../../../../src/model/entity/Room';
import { INJECT_EVENT } from '../../../../src/module';
import { CoreModule } from '../../../../src/module/CoreModule';
import { EventBus } from '../../../../src/service/event';
import { NodeFetchLoader } from '../../../../src/service/loader/node/FetchLoader';
import { YamlParser } from '../../../../src/service/parser/YamlParser';
import { onceEvent } from '../../../../src/util/async/event';
import {
  EVENT_LOADER_DONE,
  EVENT_LOADER_READ,
  EVENT_LOADER_STATE,
  EVENT_LOADER_WORLD,
} from '../../../../src/util/constants';
import { makeTestState, makeTestWorld } from '../../../entity';
import { getTestContainer } from '../../../helper';

describe('node fetch loader', () => {
  it('should read from URLs', async () => {
    const container = await getTestContainer(new CoreModule());

    const payload = 'foo';
    const fetch = stub().returns({
      text: () => Promise.resolve(payload),
    });
    const loader = await container.create(NodeFetchLoader, {}, fetch);

    await expect(loader.loadStr('README.md')).to.eventually.equal(payload);
    await expect(loader.load('README.md')).to.eventually.deep.equal(Buffer.from(payload));
  });

  it('should not implement save', async () => {
    const container = await getTestContainer(new CoreModule());

    const fetch = stub();
    const loader = await container.create(NodeFetchLoader, {}, fetch);
    const path = 'out/test.md';

    await expect(loader.save(path, Buffer.from('foo'))).to.eventually.be.rejectedWith(NotImplementedError);
    await expect(loader.saveStr(path, 'foo')).to.eventually.be.rejectedWith(NotImplementedError);
  });

  it('should respond to read events for URLs', async () => {
    const container = await getTestContainer(new CoreModule());

    const state = makeTestState('', []);
    const world = makeTestWorld([{
      base: {
        items: [],
        meta: {
          id: '',
          desc: {
            base: '',
            type: 'string',
          },
          name: {
            base: '',
            type: 'string',
          },
        },
        scripts: new Map(),
        slots: new Map(),
        source: {
          base: ActorSource.BEHAVIOR,
          type: 'string',
        },
        stats: new Map(),
        type: {
          base: ACTOR_TYPE,
          type: 'string',
        },
      },
      mods: [],
    }], [{
      base: {
        meta: {
          id: '',
          desc: {
            base: '',
            type: 'string',
          },
          name: {
            base: '',
            type: 'string',
          },
        },
        scripts: new Map(),
        slot: {
          base: '',
          type: 'string',
        },
        stats: new Map(),
        type: {
          base: ITEM_TYPE,
          type: 'string',
        },
      },
      mods: [],
    }], [{
      base: {
        dest: {
          base: '',
          type: 'string',
        },
        link: {
          base: '',
          type: 'string',
        },
        groupKey: {
          base: '',
          type: 'string',
        },
        groupSource: {
          base: '',
          type: 'string',
        },
        groupTarget: {
          base: '',
          type: 'string',
        },
        meta: {
          desc: {
            base: '',
            type: 'string',
          },
          id: '',
          name: {
            base: '',
            type: 'string',
          },
        },
        scripts: new Map(),
        type: {
          base: PORTAL_TYPE,
          type: 'string',
        },
      },
      mods: [],
    }], [{
      base: {
        actors: [],
        items: [],
        meta: {
          id: '',
          desc: {
            base: '',
            type: 'string',
          },
          name: {
            base: '',
            type: 'string',
          },
        },
        portals: [],
        scripts: new Map(),
        type: {
          base: ROOM_TYPE,
          type: 'string',
        },
      },
      mods: [],
    }]);

    const parser = await container.create(YamlParser);
    const payload = parser.save({
      state,
      worlds: [world]
    });
    console.log(payload);

    const fetch = stub().returns({
      text: () => Promise.resolve(payload),
    });
    const loader = await container.create(NodeFetchLoader, {}, fetch);
    await loader.start();

    const events = await container.create<EventBus, BaseOptions>(INJECT_EVENT);
    const pendingDone = onceEvent(events, EVENT_LOADER_DONE);
    const pendingState = onceEvent(events, EVENT_LOADER_STATE);
    const pendingWorld = onceEvent(events, EVENT_LOADER_WORLD);

    const doneStub = stub();
    const stateStub = stub();
    const worldStub = stub();
    events.on(EVENT_LOADER_DONE, doneStub);
    events.on(EVENT_LOADER_STATE, stateStub);
    events.on(EVENT_LOADER_WORLD, worldStub);

    events.emit(EVENT_LOADER_READ, {
      path: 'https://foo',
    });

    await Promise.all([pendingDone, pendingState, pendingWorld]);
    expect(stateStub, 'loaded state').to.have.callCount(1).and.been.calledWith({ state }).and.calledBefore(doneStub);
    expect(worldStub, 'loaded world').to.have.callCount(1).and.been.calledWithMatch(
      match.hasNested('world.meta.id', world.meta.id)
    ).and.calledBefore(doneStub);
  });
});
