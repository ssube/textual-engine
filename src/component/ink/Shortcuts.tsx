import { doesExist, Maybe } from '@apextoaster/js-utils';
import { Box, Text, useFocus } from 'ink';
import SelectInputModule from 'ink-select-input';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { LegacyModule } from '../../util/types.js';
import { SHORTCUT_TABS, ShortcutKeys, ShortcutProps } from '../shared.js';

const { default: SelectInput } = (SelectInputModule as unknown as LegacyModule<typeof SelectInputModule>);
const { useState } = React;

export const Shortcuts = (props: ShortcutProps): JSX.Element => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<ShortcutKeys>('actors');
  const { isFocused: tabFocus } = useFocus();
  const { isFocused: itemFocus } = useFocus();

  function selectItem(item: Maybe<{ label: string; value: string }>) {
    if (doesExist(item)) {
      if (tab === 'verbs') {
        props.onVerb(item.value);
      } else {
        props.onTarget(item.value);
      }
    }
  }

  const items = props[tab].map((it) => ({
    label: t(it.name),
    value: it.id,
  }));

  return <Box flexDirection='column'>
    <Box marginBottom={1}>
      <SelectInput
        indicatorComponent={tabFocus ? FocusedIndicator : UnfocusedIndicator}
        isFocused={tabFocus}
        items={SHORTCUT_TABS}
        onSelect={(it) => setTab(it.value as ShortcutKeys)}
      />
    </Box>
    <Box>
      <SelectInput
        indicatorComponent={itemFocus ? FocusedIndicator : UnfocusedIndicator}
        isFocused={itemFocus}
        items={items}
        onSelect={selectItem}
      />
    </Box>
  </Box>;
};

interface SelectedProps {
  isSelected?: boolean;
}

export const FocusedIndicator = ({ isSelected }: SelectedProps): JSX.Element => (
  <Box marginRight={1}>
    {isSelected ? <Text color="green">&gt;</Text> : <Text> </Text>}
  </Box>
);

export const UnfocusedIndicator = ({ isSelected }: SelectedProps): JSX.Element => (
  <Box marginRight={1}>
    {isSelected ? <Text color="blue">&gt;</Text> : <Text> </Text>}
  </Box>
);
