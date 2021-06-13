import { expect } from 'chai';
import { EventEmitter } from 'events';
import { stub } from 'sinon';

import { AbortEventError } from '../../../src/lib';
import { catchAndLog, onceWithRemove } from '../../../src/util/async/event';
import { getTestLogger } from '../../helper';

describe('event utils', () => {
  describe('once with removal helper', () => {
    it('should reject the promise with an abort error if it has not been settled', async () => {
      const events = new EventEmitter();
      const { pending, remove } = onceWithRemove(events, 'foo');
      remove();
      return expect(pending).to.eventually.be.rejectedWith(AbortEventError);
    });

    it('should call the inner function', async () => {
      const events = new EventEmitter();
      const inner = stub();
      const { pending } = onceWithRemove(events, 'foo', inner);
      const data = {};
      events.emit('foo', data);

      await expect(pending).to.eventually.equal(data);
      expect(inner).to.have.callCount(1);
    });
  });

  describe('catch and log helper', () => {
    it('should log an error when the promise is rejected', async () => {
      const logger = getTestLogger();
      const errorStub = stub(logger, 'error');
      const error = new Error();
      catchAndLog(Promise.reject(error), logger, 'msg');
      await Promise.resolve(); // clear the queue
      expect(errorStub).to.have.callCount(1);
    });
  });
});
