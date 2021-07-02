import { expect } from 'chai';
import { ScriptRef } from '../../src/model/Script';
import { SIGNAL_ENTER, SIGNAL_REPLACE, STAT_HEALTH, VERB_DROP, VERB_EQUIP, VERB_WAIT } from '../../src/util/constants';

import { getEventShortcuts } from '../../src/util/render';
import { makeTestActor, makeTestItem, makeTestPortal, makeTestRoom } from '../entity';

describe('render shortcuts helper', () => {
  it('should include actors and items by name', async () => {
    const item = makeTestItem('', '', '');
    const npc = makeTestActor('npc', 'NPC', '');
    const player = makeTestActor('player', 'Player', '');
    const room = makeTestRoom('', '', '', [npc, player], [item]);
    const { shortcuts } = getEventShortcuts({
      actor: player,
      pid: 'player',
      room,
    });

    expect(shortcuts.actors).to.have.lengthOf(1);
    expect(shortcuts.items).to.have.lengthOf(1);
  });

  it('should include portals by group and name', async () => {
    const portal = makeTestPortal('', '', '', '', '');
    const room = makeTestRoom('', '', '', [], [], [portal]);
    const { shortcuts } = getEventShortcuts({
      actor: makeTestActor('player', 'Player', ''),
      pid: 'player',
      room,
    });

    expect(shortcuts.portals).to.have.lengthOf(1);
  });

  it('should include verbs by name', async () => {
    const script: ScriptRef = {
      data: new Map(),
      name: 'test',
    };

    const actor = makeTestActor('', '', '');
    actor.scripts.set(SIGNAL_ENTER, script);
    actor.scripts.set(SIGNAL_REPLACE, script);
    actor.scripts.set(VERB_WAIT, script);
    actor.scripts.set(VERB_DROP, script);

    const room = makeTestRoom('', '', '');
    room.scripts.set(VERB_WAIT, script);
    room.scripts.set(VERB_EQUIP, script);

    const { shortcuts } = getEventShortcuts({
      actor,
      pid: '',
      room,
    });

    expect(shortcuts.verbs).to.have.lengthOf(3);
  });

  it('should include common stats', async () => {
    const player = makeTestActor('player', 'Player', '');
    player.stats.set(STAT_HEALTH, 1);
    player.stats.set('uncommon', 1);

    const room = makeTestRoom('', '', '', [player]);
    const { stats } = getEventShortcuts({
      actor: player,
      pid: '',
      room,
    });

    expect(stats).to.have.lengthOf(1);
  });
});
