import { expect } from 'chai';
import { Container, NullLogger } from 'noicejs';

import { CoreModule } from '../../../src/module/CoreModule';

describe('node event bus', () => {
  /**
   * this is close to testing the underlying library/Node functionality, but both `emit` and `on` are
   * overridden and do other things before calling `super.*`, which does need to be tested.
   */
  it('should emit events to registered listeners');
  it('should remove listeners by group');
});
