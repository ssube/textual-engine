import { doesExist, mustExist, Optional } from '@apextoaster/js-utils';
import { expect } from 'chai';
import { SinonFakeTimers, stub, useFakeTimers } from 'sinon';

import { debounce, throttle } from '../../../src/util/async/Throttle.js';

describe('throttle utils', () => {
  let clock: Optional<SinonFakeTimers>;

  before(() => {
    clock = useFakeTimers();
  });

  after(() => {
    if (doesExist(clock)) {
      clock.restore();
    }
  });

  describe('debounce helper', () => {
    it('should throttle calls', async () => {
      const inner = stub();
      const slow = debounce(10, inner);

      slow.call();
      slow.call();
      await mustExist(clock).tickAsync(20);

      expect(inner).to.have.callCount(1);
    });

    it('should not call after being cleared', async () => {
      const inner = stub();
      const slow = debounce(10, inner);

      slow.call();
      slow.clear();
      await mustExist(clock).tickAsync(20);

      expect(inner).to.have.callCount(0);
    });

    it('should handle being repeatedly cleared', async () => {
      const inner = stub();
      const slow = debounce(10, inner);

      slow.call();
      slow.call();
      slow.clear();
      slow.clear();

      await mustExist(clock).tickAsync(20);

      expect(inner).to.have.callCount(0);
    });
  });

  describe('throttle helper', () => {
    it('should throttle calls', async () => {
      const inner = stub();
      const slow = throttle(10, inner);

      slow.call();
      slow.call();
      await mustExist(clock).tickAsync(20);

      expect(inner).to.have.callCount(1);
    });

    it('should not call after being cleared', async () => {
      const inner = stub();
      const slow = throttle(10, inner);

      slow.call(); // start throttling

      expect(inner).to.have.callCount(1);

      slow.call(); // should be throttled
      slow.clear(); // cancels the throttled call
      await mustExist(clock).tickAsync(20);

      expect(inner).to.have.callCount(1);
    });

    it('should handle being repeatedly cleared', async () => {
      const inner = stub();
      const slow = throttle(10, inner);

      slow.call();
      slow.call();
      slow.clear();
      slow.clear();

      await mustExist(clock).tickAsync(20);

      expect(inner).to.have.callCount(1);
    });
  });
});
