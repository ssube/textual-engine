import { doesExist, Optional } from '@apextoaster/js-utils';
import { Box, useFocus } from 'ink';
import SelectInput from 'ink-select-input';
import * as React from 'react';

import { ShortcutKeys, ShortcutProps } from '../shared';

const { useState } = React;

const SHORTCUT_TABS = [{
  label: 'Actors',
  value: 'actors',
}, {
  label: 'Items',
  value: 'items',
}, {
  label: 'Portals',
  value: 'portals',
}];

export const Shortcuts = (props: ShortcutProps): JSX.Element => {
  const [tab, setTab] = useState<ShortcutKeys>('actors');
  const { isFocused: tabFocus } = useFocus();
  const { isFocused: itemFocus } = useFocus();

  function selectItem(item: Optional<{label: string; value: string}>) {
    if (doesExist(item)) {
      props.onSelect(item.value);
    }
  }

  return <Box flexDirection='column'>
    <Box marginBottom={1}>
      <SelectInput isFocused={tabFocus} items={SHORTCUT_TABS} onSelect={(it) => setTab(it.value as ShortcutKeys)} />
    </Box>
    <Box>
      <SelectInput isFocused={itemFocus} items={props[tab].map((it) => ({
        label: it.name,
        value: it.id,
      }))} onSelect={selectItem} />
    </Box>
  </Box>;
};
