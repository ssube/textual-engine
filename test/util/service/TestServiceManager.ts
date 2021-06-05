import { expect } from 'chai';
import { stub } from 'sinon';

import { CoreModule } from '../../../src/module/CoreModule';
import { Service } from '../../../src/service';
import { ServiceManager } from '../../../src/util/service/ServiceManager';
import { getTestContainer } from '../../helper';

describe('service manager', () => {
  it('should start services after creation', async () => {
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
      actors: [serviceRef],
      loaders: [serviceRef],
      renders: [serviceRef],
      states: [serviceRef],
    });

    expect(service.start, 'start called').to.have.callCount(4);
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
    });
    await manager.stop();

    expect(service.start, 'start called').to.have.callCount(1);
    expect(service.stop, 'stop called').to.have.callCount(1);
  });

  xit('should store added services');
  xit('should create configured loader services');
  xit('should create configured actor services');
  xit('should create configured render services');
  xit('should create configured state services');
});
