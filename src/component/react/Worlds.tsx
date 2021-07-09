import * as React from 'react';

import { WorldProps } from '../shared';

export const Worlds = (props: WorldProps): JSX.Element => <div>
  <select id="world-menu" onChange={(event) => props.onClick(event.target.value)}>
    {props.worlds.map((it) => <option
      id={`world-${it.id}`}
      key={it.id}
      value={it.id}
    >{it.id}</option>)}
  </select>
</div>;
