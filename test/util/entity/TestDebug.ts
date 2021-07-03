import { expect } from 'chai';

import { WorldState } from '../../../src/model/world/State';
import { zeroStep } from '../../../src/util/entity';
import { debugState, graphState } from '../../../src/util/entity/debug';
import { makeTestActor, makeTestItem, makeTestPortal, makeTestRoom } from '../../entity';

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
      step: zeroStep(),
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
      rooms: [
        // all IDs must be graphviz-safe, underscores rather than dashes
        makeTestRoom('room_1', '', '', [
          makeTestActor('actor_1', '', ''),
        ], [
          makeTestItem('item_1', '', ''),
        ], [
          makeTestPortal('portal_1', '', '', '', 'room_2'),
        ]),
      ],
      start: {
        room: '',
      },
      step: zeroStep(),
      world: {
        depth: 0,
        id: '',
        seed: '',
      },
    };

    const lines = graphState(state);
    expect(lines).to.include('strict digraph {');

    for (const room of state.rooms) {
      expect(lines.some((it) => it.includes(room.meta.id)), `should include room ${room.meta.id}`).to.equal(true);
    }
  });
});

