import * as React from 'react';

import { ArrayEditor } from './collection/ArrayEditor';
import { ActorEditor } from './template/ActorEditor';
import { ItemEditor } from './template/ItemEditor';
import { MetaEditor } from './template/MetaEditor';
import { PortalEditor } from './template/PortalEditor';
import { RefEditor } from './template/RefEditor';
import { RoomEditor } from './template/RoomEditor';

export const WorldEditor = (): React.ReactElement => <div>
  <MetaEditor />
  <div>
    <div>Defaults</div>
    <ActorEditor />
    <ItemEditor />
    <PortalEditor />
    <RoomEditor />
  </div>
  <div>
    <div>Start</div>
    <div>Actors</div>
    <ArrayEditor data={[]} max={10} valueEditor={RefEditor} />
    <div>Room</div>
    <ArrayEditor data={[]} max={10} valueEditor={RefEditor} />
  </div>
  <div>
    <div>Templates</div>
    <ArrayEditor data={[]} max={10} valueEditor={ActorEditor} />
    <ArrayEditor data={[]} max={10} valueEditor={ItemEditor} />
    <ArrayEditor data={[]} max={10} valueEditor={PortalEditor} />
    <ArrayEditor data={[]} max={10} valueEditor={RoomEditor} />
  </div>
</div>;
