import { expect } from 'chai';
import * as React from 'react';
import TestRenderer from 'react-test-renderer';
import { stub } from 'sinon';

import { Shortcuts } from '../../../src/component/react/Shortcuts';
import { getReactStrings } from './helper';

describe('react shortcut component', () => {
  it('should show categories', async () => {
    const targetStub = stub();
    const verbStub = stub();
    const root = React.createElement(Shortcuts, {
      actors: [],
      items: [],
      portals: [],
      verbs: [],
      onTarget: targetStub,
      onVerb: verbStub,
    });

    const renderer = TestRenderer.create(root);
    const strings = getReactStrings(renderer.root);

    expect(strings).to.include('Actors').and.to.include('Items');
  });

  it('should update the target', async () => {
    const targetStub = stub();
    const verbStub = stub();
    const root = React.createElement(Shortcuts, {
      actors: [{
        id: 'foo',
        name: 'Foo',
      }],
      items: [],
      portals: [],
      verbs: [],
      onTarget: targetStub,
      onVerb: verbStub,
    });

    const renderer = TestRenderer.create(root);

    const tabButton = renderer.root.findByProps({ id: 'tab-actors' });
    tabButton.props.onClick();

    const targetButton = renderer.root.findByProps({ id: 'item-foo' });
    targetButton.props.onClick();

    expect(targetStub).to.have.callCount(1);
    expect(verbStub).to.have.callCount(0);
  });

  it('should update the verb', async () => {
    const targetStub = stub();
    const verbStub = stub();
    const root = React.createElement(Shortcuts, {
      actors: [],
      items: [],
      portals: [],
      verbs: [{
        id: 'bar',
        name: 'Bar',
      }],
      onTarget: targetStub,
      onVerb: verbStub,
    });

    const renderer = TestRenderer.create(root);

    const tabButton = renderer.root.findByProps({ id: 'tab-verbs' });
    tabButton.props.onClick();

    const targetButton = renderer.root.findByProps({ id: 'item-bar' });
    targetButton.props.onClick();

    expect(targetStub).to.have.callCount(0);
    expect(verbStub).to.have.callCount(1);
  });

  xit('should highlight the selected category');
});
