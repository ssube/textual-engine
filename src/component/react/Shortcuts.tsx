import * as React from 'react';

import { ShortcutKeys, ShortcutProps } from '../shared';

const { useState } = React;

export const Shortcuts = (props: ShortcutProps): JSX.Element => {
  const [selected, setSelected] = useState<ShortcutKeys>('actors');

  return <div>
    <div>
      <button onClick={() => setSelected('actors')}>Actors</button>
      <button onClick={() => setSelected('items')}>Items</button>
      <button onClick={() => setSelected('portals')}>Portals</button>
    </div>
    <div>
      <ol>
        {props[selected].map((it) => <li key={it.id}>
          <a onClick={() => props.onSelect(it.id)}>{it.name}</a>
        </li>)}
      </ol>
    </div>
  </div>;
};
