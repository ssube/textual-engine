import { Box, Text, useFocus } from 'ink';
import TextInputModule from 'ink-text-input';
import * as React from 'react';

import { LegacyModule } from '../../util/types.js';
import { InputProps } from '../shared.js';

const { default: TextInput } = (TextInputModule as unknown as LegacyModule<typeof TextInputModule>);

/**
 * Wrapper for focus handling.
 */
export const Input = (props: InputProps): JSX.Element => {
  const { isFocused } = useFocus({
    autoFocus: true,
  });

  return <Box>
    <Box marginRight={1}>
      <Text color="blueBright">{props.prompt} &gt;</Text>
    </Box>
    <TextInput
      focus={isFocused}
      onChange={(value) => {
        props.onChange(value);
      }}
      onSubmit={(value) => {
        props.onLine(value);
      }}
      value={props.line}
    />
  </Box>;
};
