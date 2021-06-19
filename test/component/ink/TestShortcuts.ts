import { expect } from 'chai';
import { render } from 'ink-testing-library';
import * as React from 'react';
import { stub } from 'sinon';

import { Shortcuts } from '../../../src/component/ink/Shortcuts';

describe('ink shortcut component', () => {
  it('should show categories', async () => {
    const select = stub();
    const root = React.createElement(Shortcuts, {
      actors: [],
      items: [],
      portals: [],
      verbs: [],
      onSelect: select,
    });

    const { lastFrame } = render(root);
    const frame = lastFrame();

    expect(frame).to.include('Actors').and.to.include('Items');
  });

  xit('should highlight the selected category');
  xit('should call the onSelect prop when the selection changes');
});
