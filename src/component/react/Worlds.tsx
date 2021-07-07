import * as React from 'react';

import { WorldProps } from '../shared';

export const Worlds = (props: WorldProps): JSX.Element => <div>
  <select onChange={(event) => props.onClick(event.target.value)}>
    {props.worlds.map((it) => <option value={it.id}>{it.id}</option>)}
  </select>
</div>;
