import { expect } from 'chai';
import * as React from 'react';
import TestRenderer from 'react-test-renderer';
import { stub } from 'sinon';

import { Shortcuts } from '../../../src/component/react/Shortcuts';
import { getReactStrings } from './TestOutput';

describe('react shortcut component', () => {
  it('should show categories', async () => {
    const select = stub();
    const root = React.createElement(Shortcuts, {
      actors: [],
      items: [],
      portals: [],
      verbs: [],
      onSelect: select,
    });
    const renderer = TestRenderer.create(root);
    const strings = getReactStrings(renderer.root);

    expect(strings).to.include('Actors').and.to.include('Items');
  });

  xit('should highlight the selected category');
  xit('should call the onSelect prop when the selection changes');
});
