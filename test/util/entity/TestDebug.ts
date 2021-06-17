import { expect } from 'chai';

import { WorldState } from '../../../src/model/world/State';
import { debugState, graphState } from '../../../src/util/entity/debug';
import { makeTestActor, makeTestItem, makeTestRoom } from '../../entity';

describe('state debug utils', () => {
  it('should include all rooms in tree output', async () => {
    const state: WorldState = {
      meta: {
        desc: '',
        id: '',
        name: '',
        template: '',
      },
      rooms: [
        makeTestRoom('room-1', '', '', [
          makeTestActor('actor-1', '', ''),
        ], [
          makeTestItem('item-1', '', ''),
        ]),
        makeTestRoom('room-2', '', '', [
          makeTestActor('actor-2', '', ''),
        ], [
          makeTestItem('item-2', '', ''),
        ]),
      ],
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
      expect(lines.some((it) => it.includes(room.meta.id))).to.equal(true);
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

