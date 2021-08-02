import { InvalidArgumentError } from '@apextoaster/js-utils';
import { expect } from 'chai';

import { CoreModule } from '../../../src/module/CoreModule.js';
import { MathRandomService } from '../../../src/service/random/MathRandom.js';
import { LocalScriptService } from '../../../src/service/script/LocalScript.js';
import { StateEntityTransfer } from '../../../src/util/entity/EntityTransfer.js';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../entity.js';
import { createTestContext, getTestContainer } from '../../helper.js';

describe('state transfer utils', () => {
  describe('move actor helper', () => {
    it('should move actors from one room to another', async () => {
      const actor = makeTestActor('bun', 'bun', 'bun');
      const sourceRoom = makeTestRoom('foo', 'foo', 'foo', [actor], []);
      const targetRoom = makeTestRoom('bar', 'bar', 'bar', [], []);

      const container = await getTestContainer(new CoreModule());
      const context = createTestContext({
        random: await container.create(MathRandomService),
        script: await container.create(LocalScriptService),
      });

      const transfer = await container.create(StateEntityTransfer);
      await transfer.moveActor({
        moving: actor,
        source: sourceRoom,
        target: targetRoom,
      }, context);

      expect(targetRoom.actors).to.have.lengthOf(1);
    });

    /**
     * this requires an `any` cast and so is unlikely to occur in the TS sources,
     * but could happen if an event or search passes the wrong entity type
     */
    it('should only move actors', async () => {
      const item = makeTestItem('bun', 'bun', 'bun');
      const sourceRoom = makeTestRoom('foo', 'foo', 'foo', [], [item]);
      const targetRoom = makeTestRoom('bar', 'bar', 'bar', [], []);

      const container = await getTestContainer(new CoreModule());

      const context = createTestContext({
        random: await container.create(MathRandomService),
        script: await container.create(LocalScriptService),
      });

      const transfer = await container.create(StateEntityTransfer);
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

    it('should only allow source rooms', async () => {
      const actor = makeTestActor('bun', 'bun', 'bun');
      const targetRoom = makeTestRoom('foo', 'foo', 'foo', [actor], []);

      const container = await getTestContainer(new CoreModule());
      const context = createTestContext({
        random: await container.create(MathRandomService),
        script: await container.create(LocalScriptService),
      });

      const transfer = await container.create(StateEntityTransfer);
      await expect(transfer.moveActor({
        moving: actor,
        source: actor as any,
        target: targetRoom,
      }, context)).to.eventually.be.rejectedWith(InvalidArgumentError);
    });

    it('should only allow target rooms', async () => {
      const actor = makeTestActor('bun', 'bun', 'bun');
      const sourceRoom = makeTestRoom('foo', 'foo', 'foo', [actor], []);

      const container = await getTestContainer(new CoreModule());
      const context = createTestContext({
        random: await container.create(MathRandomService),
        script: await container.create(LocalScriptService),
      });

      const transfer = await container.create(StateEntityTransfer);
      await expect(transfer.moveActor({
        moving: actor,
        source: sourceRoom,
        target: actor as any,
      }, context)).to.eventually.be.rejectedWith(InvalidArgumentError);
    });

    it('should only move actors that are within the source room', async () => {
      const actor = makeTestActor('bun', 'bun', 'bun');
      const sourceRoom = makeTestRoom('foo', 'foo', 'foo', [], []);
      const targetRoom = makeTestRoom('bar', 'bar', 'bar', [], []);

      const container = await getTestContainer(new CoreModule());
      const context = createTestContext({
        random: await container.create(MathRandomService),
        script: await container.create(LocalScriptService),
      });

      const transfer = await container.create(StateEntityTransfer);
      await expect(transfer.moveActor({
        moving: actor,
        source: sourceRoom,
        target: targetRoom,
      }, context)).to.eventually.be.rejectedWith(InvalidArgumentError);
    });

    it('should handle the source and target being the same', async () => {
      const actor = makeTestActor('bun', 'bun', 'bun');
      const room = makeTestRoom('foo', 'foo', 'foo', [actor], []);

      const container = await getTestContainer(new CoreModule());
      const context = createTestContext({
        random: await container.create(MathRandomService),
        script: await container.create(LocalScriptService),
      });

      const transfer = await container.create(StateEntityTransfer);
      await expect(transfer.moveActor({
        moving: actor,
        source: room,
        target: room,
      }, context)).to.eventually.equal(undefined);
    });

    xit('should invoke the enter script on the destination room');
  });

  describe('move item helper', () => {
    it('should move items from one entity to another', async () => {
      const item = makeTestItem('bun', 'bun', 'bun');
      const sourceRoom = makeTestRoom('foo', 'foo', 'foo', [], [item]);
      const targetRoom = makeTestRoom('bar', 'bar', 'bar', [], []);

      const container = await getTestContainer(new CoreModule());
      const context = createTestContext({
        random: await container.create(MathRandomService),
        script: await container.create(LocalScriptService),
      });

      const transfer = await container.create(StateEntityTransfer);
      await transfer.moveItem({
        moving: item,
        source: sourceRoom,
        target: targetRoom,
      }, context);

      expect(sourceRoom.items).to.have.lengthOf(0);
      expect(targetRoom.items).to.have.lengthOf(1);
    });

    it('should only move items', async () => {
      const actor = makeTestActor('bun', 'bun', 'bun');
      const sourceRoom = makeTestRoom('foo', 'foo', 'foo', [actor], []);
      const targetRoom = makeTestRoom('bar', 'bar', 'bar', [], []);

      const container = await getTestContainer(new CoreModule());
      const context = createTestContext({
        random: await container.create(MathRandomService),
        script: await container.create(LocalScriptService),
      });

      const transfer = await container.create(StateEntityTransfer);
      await expect(transfer.moveItem({
        moving: actor as any,
        source: sourceRoom,
        target: targetRoom,
      }, context)).to.eventually.be.rejectedWith(InvalidArgumentError);

      // should still be in source room
      expect(sourceRoom.actors).to.have.lengthOf(1);
      expect(targetRoom.actors).to.have.lengthOf(0);
    });

    it('should target both actors and rooms', async () => {
      const item = makeTestItem('bun', 'bun', 'bun');
      const actor = makeTestActor('bar', 'bar', 'bar');
      const room = makeTestRoom('foo', 'foo', 'foo', [], [item]);

      const container = await getTestContainer(new CoreModule());
      const context = createTestContext({
        random: await container.create(MathRandomService),
        script: await container.create(LocalScriptService),
      });

      const transfer = await container.create(StateEntityTransfer);
      await transfer.moveItem({
        moving: item,
        source: room,
        target: actor,
      }, context);

      expect(room.items).to.have.lengthOf(0);
      expect(actor.items).to.have.lengthOf(1);

      await transfer.moveItem({
        moving: item,
        source: actor,
        target: room,
      }, context);

      expect(room.items).to.have.lengthOf(1);
      expect(actor.items).to.have.lengthOf(0);
    });

    it('should not allow source items', async () => {
      const moving = makeTestItem('bun', 'bun', 'bun');
      const source = makeTestItem('bar', 'bar', 'bar');
      const room = makeTestRoom('foo', 'foo', 'foo', [], [moving]);

      const container = await getTestContainer(new CoreModule());
      const context = createTestContext({
        random: await container.create(MathRandomService),
        script: await container.create(LocalScriptService),
      });

      const transfer = await container.create(StateEntityTransfer);
      return expect(transfer.moveItem({
        moving,
        source: source as any,
        target: room,
      }, context)).to.eventually.be.rejectedWith(InvalidArgumentError);
    });

    it('should not allow target items', async () => {
      const moving = makeTestItem('bun', 'bun', 'bun');
      const room = makeTestRoom('foo', 'foo', 'foo', [], [moving]);
      const target = makeTestItem('bar', 'bar', 'bar');

      const container = await getTestContainer(new CoreModule());
      const transfer = await container.create(StateEntityTransfer);
      const context = createTestContext();

      return expect(transfer.moveItem({
        moving,
        source: room,
        target: target as any,
      }, context)).to.eventually.be.rejectedWith(InvalidArgumentError);
    });

    it('should only move items that are within the source entity', async () => {
      const item = makeTestItem('bun', 'bun', 'bun');
      const actor = makeTestActor('bar', 'bar', 'bar');
      const room = makeTestRoom('foo', 'foo', 'foo', [], []);

      const container = await getTestContainer(new CoreModule());
      const context = createTestContext({
        random: await container.create(MathRandomService),
        script: await container.create(LocalScriptService),
      });

      const transfer = await container.create(StateEntityTransfer);
      return expect(transfer.moveItem({
        moving: item,
        source: room,
        target: actor,
      }, context)).to.eventually.be.rejectedWith(InvalidArgumentError);
    });

    it('should not invoke scripts when the source and target are the same', async () => {
      const item = makeTestItem('bun', 'bun', 'bun');
      const room = makeTestRoom('foo', 'foo', 'foo', [], []);

      const container = await getTestContainer(new CoreModule());
      const transfer = await container.create(StateEntityTransfer);
      const context = createTestContext();

      await transfer.moveItem({
        moving: item,
        source: room,
        target: room,
      }, context);

      expect(context.script.invoke).to.have.callCount(0);
    });

    xit('should invoke the get script on the destination entity');
  });

  describe('move room helper', () => {
    it('should move the contents of the room', async () => {
      const actor = makeTestActor('', '', '');
      const item = makeTestItem('bun', 'bun', 'bun');
      const sourceRoom = makeTestRoom('foo', 'foo', 'foo', [actor], [item]);
      const targetRoom = makeTestRoom('bar', 'bar', 'bar', [], []);

      const container = await getTestContainer(new CoreModule());
      const context = createTestContext({
        random: await container.create(MathRandomService),
        script: await container.create(LocalScriptService),
      });

      const transfer = await container.create(StateEntityTransfer);
      await transfer.moveRoom({
        moving: undefined,
        source: sourceRoom,
        target: targetRoom,
      }, context);

      expect(sourceRoom.actors).to.have.lengthOf(0);
      expect(sourceRoom.items).to.have.lengthOf(0);

      expect(targetRoom.actors).to.have.lengthOf(1);
      expect(targetRoom.items).to.have.lengthOf(1);
    });

    it('should only allow source rooms', async () => {
      const actor = makeTestActor('bun', 'bun', 'bun');
      const targetRoom = makeTestRoom('foo', 'foo', 'foo', [actor], []);

      const container = await getTestContainer(new CoreModule());
      const context = createTestContext({
        random: await container.create(MathRandomService),
        script: await container.create(LocalScriptService),
      });

      const transfer = await container.create(StateEntityTransfer);
      await expect(transfer.moveRoom({
        moving: undefined,
        source: actor as any,
        target: targetRoom,
      }, context)).to.eventually.be.rejectedWith(InvalidArgumentError);
    });

    it('should only allow target rooms', async () => {
      const actor = makeTestActor('bun', 'bun', 'bun');
      const sourceRoom = makeTestRoom('foo', 'foo', 'foo', [actor], []);

      const container = await getTestContainer(new CoreModule());
      const context = createTestContext({
        random: await container.create(MathRandomService),
        script: await container.create(LocalScriptService),
      });

      const transfer = await container.create(StateEntityTransfer);
      await expect(transfer.moveRoom({
        moving: undefined,
        source: sourceRoom,
        target: actor as any,
      }, context)).to.eventually.be.rejectedWith(InvalidArgumentError);
    });
  });
});
