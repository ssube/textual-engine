import * as React from 'react';
import TextInput from 'ink-text-input';
import { useFocus } from 'ink';
import { InputProps } from '../shared';

/**
 * Wrapper for focus handling.
 */
export const Input = (props: InputProps): JSX.Element => {
  const {isFocused} = useFocus();

  return <TextInput
    focus={isFocused}
    onChange={(value) => {
      props.onChange(value);
    }}
    onSubmit={(value) => {
      props.onLine(value);
    }}
    value={props.line}
  />;
};
