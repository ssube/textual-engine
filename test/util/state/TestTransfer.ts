import { InvalidArgumentError } from '@apextoaster/js-utils';
import { expect } from 'chai';

import { CoreModule } from '../../../src/module/CoreModule';
import { MathRandomGenerator } from '../../../src/service/random/MathRandom';
import { ScriptContext } from '../../../src/service/script';
import { LocalScriptService } from '../../../src/service/script/LocalScript';
import { StateEntityTransfer } from '../../../src/util/state/EntityTransfer';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../entity';
import { getStubHelper, getTestContainer, getTestLogger } from '../../helper';

describe('state transfer utils', () => {
  describe('move actor helper', () => {
    it('should move actors from one room to another', async () => {
      const actor = makeTestActor('bun', 'bun', 'bun');
      const sourceRoom = makeTestRoom('foo', 'foo', 'foo', [actor], []);
      const targetRoom = makeTestRoom('bar', 'bar', 'bar', [], []);

      const container = await getTestContainer(new CoreModule());
      const transfer = await container.create(StateEntityTransfer);

      await transfer.moveActor({
        moving: actor,
        source: sourceRoom,
        target: targetRoom,
      }, {
        data: new Map(),
        logger: getTestLogger(),
        random: await container.create(MathRandomGenerator),
        script: await container.create(LocalScriptService),
        state: getStubHelper(),
        transfer: await container.create(StateEntityTransfer),
      });

      expect(targetRoom.actors).to.have.lengthOf(1);
    });

    /**
     * this requires an `any` cast and so is unlikely to occur in the TS sources,
     * but could happen if an event or search passes the wrong entity type
     */
    xit('should only move actors', async () => {
      const item = makeTestItem('bun', 'bun', 'bun');
      const sourceRoom = makeTestRoom('foo', 'foo', 'foo', [], [item]);
      const targetRoom = makeTestRoom('bar', 'bar', 'bar', [], []);

      const container = await getTestContainer(new CoreModule());
      const transfer = await container.create(StateEntityTransfer);

      const context: ScriptContext = {
        data: new Map(),
        logger: getTestLogger(),
        random: await container.create(MathRandomGenerator),
        script: await container.create(LocalScriptService),
        state: getStubHelper(),
        transfer: await container.create(StateEntityTransfer),
      };

      await expect(transfer.moveActor({
        moving: item as any,
        source: sourceRoom,
        target: targetRoom,
      }, context)).to.eventually.be.rejectedWith(InvalidArgumentError);
      await expect(transfer.moveActor({
        moving: sourceRoom as any,
        source: sourceRoom,
        target: targetRoom,
      }, context)).to.eventually.be.rejectedWith(InvalidArgumentError);
    });

    xit('should only target rooms');
    xit('should only move actors that are within the source room');
    xit('should invoke the enter script on the destination room');

    // should this one exist or is that too internal?
    xit('should not modify the moving object when the source and target are the same');
  });

  describe('move item helper', () => {
    xit('should move items from one entity to another');
    xit('should only move items');
    xit('should target both actors and rooms');
    xit('should only move items that are within the source entity');
    xit('should invoke the get script on the destination entity');
  });
});
