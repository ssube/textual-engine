import { expect } from 'chai';

import { ReactionConfig, SidebarConfig, State } from '../../src/model/State';
import { debugState, graphState } from '../../src/util/debug';

describe('state debug utils', () => {
  it('should include all rooms in tree output', async () => {
    const state: State = {
      config: {
        reaction: ReactionConfig.PLAYER_FIRST,
        seed: '',
        sidebar: SidebarConfig.ALWAYS_OPEN,
        world: '',
      },
      focus: {
        actor: '',
        room: '',
      },
      input: new Map(),
      rooms: [], // TODO: add some rooms
    };

    const lines = await debugState(state);
    expect(lines).to.include('state: ');

    for (const room of state.rooms) {
      expect(lines).to.include(room.meta.name);
    }
  });

  it('should include all rooms in graph output', async () => {
    const state: State = {
      config: {
        reaction: ReactionConfig.PLAYER_FIRST,
        seed: '',
        sidebar: SidebarConfig.ALWAYS_OPEN,
        world: '',
      },
      focus: {
        actor: '',
        room: '',
      },
      input: new Map(),
      rooms: [], // TODO: add some rooms
    };

    const lines = await graphState(state);
    expect(lines).to.include('strict graph {');

    for (const room of state.rooms) {
      expect(lines).to.include(room.meta.name);
    }
  });
});

