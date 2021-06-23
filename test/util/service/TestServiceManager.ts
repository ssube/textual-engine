import { InvalidArgumentError } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { stub } from 'sinon';

import { CoreModule } from '../../../src/module/CoreModule';
import { Service } from '../../../src/service';
import { ServiceManager } from '../../../src/util/service/ServiceManager';
import { getTestContainer } from '../../helper';

const TEST_SERVICES = {
      actors: [{
        kind: 'foo',
        name: 'foo-actor',
      }],
      loaders: [{
        kind: 'foo',
        name: 'foo-loader',
      }],
      renders: [{
        kind: 'foo',
        name: 'foo-render',
      }],
      states: [{
        kind: 'foo',
        name: 'foo-state',
      }],
      tokenizers: [{
        kind: 'foo',
        name: 'foo-tokenizer',
      }],
 
};

describe('service manager', () => {
  it('should start services after creation', async () => {
    const service: Service = {
      start: stub(),
      stop: stub(),
    };
    const module = new CoreModule();
    module.bind('foo').toInstance(service);

    const container = await getTestContainer(module);

    const manager = await container.create(ServiceManager);
    await manager.create(TEST_SERVICES);

    expect(service.start, 'start called').to.have.callCount(5); // five kinds of managed services
    expect(service.stop, 'stop called').to.have.callCount(0);
  });

  it('should stop services on request', async () => {
    const service: Service = {
      start: stub(),
      stop: stub(),
    };
    const module = new CoreModule();
    module.bind('foo').toInstance(service);

    const container = await getTestContainer(module);

    const serviceRef = {
      kind: 'foo',
      name: 'foo',
    };
    const manager = await container.create(ServiceManager);
    await manager.create({
      actors: [],
      loaders: [serviceRef],
      renders: [],
      states: [],
      tokenizers: [],
    });
    await manager.stop();

    expect(service.start, 'start called').to.have.callCount(1);
    expect(service.stop, 'stop called').to.have.callCount(1);
  });

  it('should prevent duplicate service names', async () => {
    const service: Service = {
      start: stub(),
      stop: stub(),
    };
    const module = new CoreModule();
    module.bind('foo').toInstance(service);

    const container = await getTestContainer(module);

    const manager = await container.create(ServiceManager);
    await manager.create(TEST_SERVICES);

    await expect(manager.create({
      actors: TEST_SERVICES.actors,
      loaders: [],
      renders: [],
      states: [],
      tokenizers: [],
    }), 'duplicate actor').to.eventually.be.rejectedWith(InvalidArgumentError);

    await expect(manager.create({
      actors: [],
      loaders: TEST_SERVICES.loaders,
      renders: [],
      states: [],
      tokenizers: [],
    }), 'duplicate loader').to.eventually.be.rejectedWith(InvalidArgumentError);

    await expect(manager.create({
      actors: [],
      loaders: [],
      renders: TEST_SERVICES.renders,
      states: [],
      tokenizers: [],
    }), 'duplicate render').to.eventually.be.rejectedWith(InvalidArgumentError);

    await expect(manager.create({
      actors: [],
      loaders: [],
      renders: [],
      states: TEST_SERVICES.states,
      tokenizers: [],
    }), 'duplicate state').to.eventually.be.rejectedWith(InvalidArgumentError);

    await expect(manager.create({
      actors: [],
      loaders: [],
      renders: [],
      states: [],
      tokenizers: TEST_SERVICES.tokenizers,
    }), 'duplicate tokenizer').to.eventually.be.rejectedWith(InvalidArgumentError);
  });

  xit('should store added services');
  xit('should pass config data to the service constructor');
});
