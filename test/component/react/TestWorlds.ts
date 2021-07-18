import { expect } from 'chai';
import * as React from 'react';
import TestRenderer from 'react-test-renderer';
import { stub } from 'sinon';

import { Worlds } from '../../../src/component/react/Worlds';
import { getReactStrings } from './helper';

describe('react worlds component', () => {
  it('should show available worlds', async () => {
    const clickStub = stub();
    const root = React.createElement(Worlds, {
      onClick: clickStub,
      worlds: [{
        id: 'foo',
        name: {
          base: 'Foo',
          type: 'string',
        },
        desc: {
          base: 'Bar',
          type: 'string',
        },
      }],
    });

    const renderer = TestRenderer.create(root);
    const strings = getReactStrings(renderer.root);

    expect(strings).to.include('foo');
  });

  it('should return the world ID on click', async () => {
    const clickStub = stub();
    const root = React.createElement(Worlds, {
      onClick: clickStub,
      worlds: [{
        id: 'foo',
        name: {
          base: 'Foo',
          type: 'string',
        },
        desc: {
          base: 'Bar',
          type: 'string',
        },
      }],
    });

    const renderer = TestRenderer.create(root);

    const worldMenu = renderer.root.findByType('select');
    worldMenu.props.onChange({
      target: {
        value: 'foo',
      }
    });

    expect(clickStub).to.have.callCount(1).and.been.calledWith('foo');
  });
});
