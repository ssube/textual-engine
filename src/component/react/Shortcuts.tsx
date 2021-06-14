import * as React from 'react';

import { ShortcutKeys, ShortcutProps, SHORTCUT_TABS } from '../shared';

const { useState } = React;

export const Shortcuts = (props: ShortcutProps): JSX.Element => {
  const [selected, setSelected] = useState<ShortcutKeys>('actors');

  return <div>
    <div>
      {SHORTCUT_TABS.map((it) => <button onClick={() => setSelected(it.value as ShortcutKeys)}>{it.label}</button>)}
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
