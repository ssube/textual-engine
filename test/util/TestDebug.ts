import { expect } from 'chai';

import { WorldState } from '../../src/model/world/State';
import { debugState, graphState } from '../../src/util/state/debug';

describe('state debug utils', () => {
  it('should include all rooms in tree output', async () => {
    const state: WorldState = {
      meta: {
        desc: '',
        id: '',
        name: '',
        template: '',
      },
      rooms: [], // TODO: add some rooms
      start: {
        room: '',
      },
      step: {
        time: 0,
        turn: 0,
      },
      world: {
        depth: 0,
        id: '',
        seed: '',
      },
    };

    const lines = debugState(state);
    expect(lines).to.include('state: ');

    for (const room of state.rooms) {
      expect(lines).to.include(room.meta.name);
    }
  });

  it('should include all rooms in graph output', async () => {
    const state: WorldState = {
      meta: {
        desc: '',
        id: '',
        name: '',
        template: '',
      },
      rooms: [], // TODO: add some rooms
      start: {
        room: '',
      },
      step: {
        time: 0,
        turn: 0,
      },
      world: {
        depth: 0,
        id: '',
        seed: '',
      },
    };

    const lines = graphState(state);
    expect(lines).to.include('strict digraph {');

    for (const room of state.rooms) {
      expect(lines).to.include(room.meta.name);
    }
  });
});

