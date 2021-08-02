import { expect } from 'chai';
import { render } from 'ink-testing-library';
import * as React from 'react';
import sinon from 'sinon';

import { Shortcuts } from '../../../src/component/ink/Shortcuts.js';
import { KEY_ARROW_DOWN, KEY_ENTER, KEY_TAB } from '../../constants.js';
import { FocusWrapper, removeEscapes, sendKeys } from './helper.js';

const { stub } = sinon;
describe('ink shortcut component', () => {
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

    const { lastFrame } = render(root);
    const frame = lastFrame();

    expect(frame).to.include('Actors').and.to.include('Items');
  });

  it('should update the target', async () => {
    const targetStub = stub();
    const verbStub = stub();
    const shortcuts = React.createElement(Shortcuts, {
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

    const { lastFrame, stdin } = render(React.createElement(FocusWrapper, {}, shortcuts));

    await sendKeys(stdin, 10, [
      KEY_TAB,        // initial
      KEY_TAB,        // tabs
      KEY_TAB,        // items
      KEY_ARROW_DOWN, // next
      KEY_ENTER,      // submit
    ]);

    const frame = removeEscapes(lastFrame());
    expect(frame).to.include('> Actors');
    expect(frame).to.include('> Foo');

    expect(targetStub, 'target').to.have.callCount(1).and.been.calledWith('foo');
    expect(verbStub, 'verb').to.have.callCount(0);
  });

  it('should update the verb', async () => {
    const targetStub = stub();
    const verbStub = stub();
    const shortcuts = React.createElement(Shortcuts, {
      actors: [{
        id: 'foo',
        name: 'Foo',
      }],
      items: [],
      portals: [],
      verbs: [{
        id: 'bar',
        name: 'Bar',
      }],
      onTarget: targetStub,
      onVerb: verbStub,
    });

    const { lastFrame, stdin } = render(React.createElement(FocusWrapper, {}, shortcuts));

    await sendKeys(stdin, 10, [
      KEY_TAB,        // initial
      KEY_TAB,        // tabs
      KEY_ARROW_DOWN, // items tab
      KEY_ARROW_DOWN, // portals tab
      KEY_ARROW_DOWN, // verbs tab
      KEY_ENTER,      // submit
      KEY_TAB,        // items
      KEY_ARROW_DOWN, // next
      KEY_ENTER,      // submit
    ]);

    const frame = removeEscapes(lastFrame());
    expect(frame).to.include('> Verbs');
    expect(frame).to.include('> Bar');

    expect(targetStub, 'target').to.have.callCount(0);
    expect(verbStub, 'verb').to.have.callCount(1).and.been.calledWith('bar');
  });

  it('should handle selections without an item', async () => {
    const targetStub = stub();
    const verbStub = stub();
    const shortcuts = React.createElement(Shortcuts, {
      actors: [],
      items: [],
      portals: [],
      verbs: [],
      onTarget: targetStub,
      onVerb: verbStub,
    });

    const { lastFrame, stdin } = render(React.createElement(FocusWrapper, {}, shortcuts));

    await sendKeys(stdin, 10, [
      KEY_TAB,        // initial
      KEY_TAB,        // tabs
      KEY_ARROW_DOWN, // items tab
      KEY_ENTER,      // submit
      KEY_TAB,        // items
      KEY_ARROW_DOWN, // next
      KEY_ENTER,      // submit
    ]);

    const frame = removeEscapes(lastFrame());
    expect(frame).to.include('> Items');

    expect(targetStub, 'target').to.have.callCount(0);
    expect(verbStub, 'verb').to.have.callCount(0);
  });

  xit('should highlight the selected category');
});
