import { mustExist } from '@apextoaster/js-utils';
import { expect } from 'chai';

import { CoreModule } from '../../src/module/CoreModule.js';
import { NodeFileLoader } from '../../src/service/loader/node/FileLoader.js';
import { StateEntityGenerator } from '../../src/util/entity/EntityGenerator.js';
import { getTestContainer } from '../helper.js';

describe('Dracula sample world', () => {
  it('should generate a closed map', async () => {
    const container = await getTestContainer(new CoreModule());

    const loader = await container.create(NodeFileLoader);
    const data = await loader.loadData('data/samples/dracula.yml');
    const [world] = mustExist(data.worlds);

    const generator = await container.create(StateEntityGenerator);
    generator.setWorld(world);
    const state = await generator.createState({
      depth: Infinity,
      id: 'test',
      seed: 'test',
    });

    expect(state.rooms, 'one of each room').to.have.lengthOf(world.templates.rooms.length);

    // all portals should be populated
    for (const room of state.rooms) {
      for (const portal of room.portals) {
        expect(portal.dest, portal.meta.id).to.have.length.greaterThan(0);
      }
    }
  });
});
