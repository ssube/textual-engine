import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { ShortcutKeys, ShortcutProps, SHORTCUT_TABS } from '../shared';

const { useState } = React;

export const Shortcuts = (props: ShortcutProps): JSX.Element => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<ShortcutKeys>('actors');

  return <div>
    <div>
      {SHORTCUT_TABS.map((it) => <button
        key={it.value}
        onClick={() => setSelected(it.value as ShortcutKeys)}
      >
        {t(it.label)}
      </button>)}
    </div>
    <div>
      <ol>
        {props[selected].map((it) => <li key={it.id}>
          <a onClick={() => props.onSelect(it.id)}>
            {t(it.name)}
          </a>
        </li>)}
      </ol>
    </div>
  </div>;
};
