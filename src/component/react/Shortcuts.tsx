import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { ShortcutKeys, ShortcutProps, SHORTCUT_TABS } from '../shared';

const { useState } = React;

export const Shortcuts = (props: ShortcutProps): JSX.Element => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<ShortcutKeys>('actors');

  function selectItem(value: string) {
    if (tab === 'verbs') {
      props.onVerb(value);
    } else {
      props.onTarget(value);
    }
  }

  return <div>
    <div>
      <ol>
        {SHORTCUT_TABS.map((it) => <li key={it.value}>
          <button
            id={`tab-${it.value}`}
            onClick={() => setTab(it.value as ShortcutKeys)}
          >
            {t(it.label)}
          </button>
        </li>)}
      </ol>
    </div>
    <div>
      <ol>
        {props[tab].map((it) => <li key={it.id}>
          <a
            id={`item-${it.id}`}
            onClick={() => selectItem(it.id)}
          >
            {t(it.name)}
          </a>
        </li>)}
      </ol>
    </div>
  </div>;
};
