import { doesExist, Optional } from '@apextoaster/js-utils';
import { Box, Text, useFocus } from 'ink';
import SelectInput from 'ink-select-input';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { SHORTCUT_TABS, ShortcutKeys, ShortcutProps } from '../shared';

const { useState } = React;

export const Shortcuts = (props: ShortcutProps): JSX.Element => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<ShortcutKeys>('actors');
  const { isFocused: tabFocus } = useFocus();
  const { isFocused: itemFocus } = useFocus();

  function selectItem(item: Optional<{ label: string; value: string }>) {
    if (doesExist(item)) {
      props.onSelect(item.value);
    }
  }

  const items = props[selected].map((it) => ({
    label: t(it.name),
    value: it.id,
  }));

  return <Box flexDirection='column'>
    <Box marginBottom={1}>
      <SelectInput
        indicatorComponent={tabFocus ? FocusedIndicator : UnfocusedIndicator}
        isFocused={tabFocus}
        items={SHORTCUT_TABS}
        onSelect={(it) => setSelected(it.value as ShortcutKeys)}
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

export const FocusedIndicator = ({ isSelected = false }: SelectedProps): JSX.Element => (
  <Box marginRight={1}>
    {isSelected ? <Text color="green">&gt;</Text> : <Text> </Text>}
  </Box>
);

export const UnfocusedIndicator = ({ isSelected = false }: SelectedProps): JSX.Element => (
  <Box marginRight={1}>
    {isSelected ? <Text color="blue">&gt;</Text> : <Text> </Text>}
  </Box>
);
