import * as EventEmitter from 'events';
import { useInput, Newline, Text } from 'ink';
import * as React from 'react';
import { InkState } from '../../InkRender';

const { useState } = React;

interface FooProps extends InkState {
  emits: EventEmitter;
}

export const Foo = (props: FooProps) => {
  const [state, setter] = useState(props);

  useInput((input, key) => {
    if (key.return) {
      console.log('adding line', state.input);
      props.emits.emit('line', state.input);
      setter({
        ...props,
        input: '',
      });
    } else if (key.backspace || key.delete) {
      setter({
        ...props,
        input: state.input.substr(0, state.input.length - 1),
      });
    } else {
      setter({
        ...props,
        input: state.input + input,
      });
    }
  });

  const output = state.output.map((line) => <Text>
    <Text color="green">{line}</Text>
    <Newline />
  </Text>);

  return <Text>
    <Text>Output: {state.output.length} lines</Text>
    <Newline />
    {output}
    <Newline />
    <Text color="blue">{state.prompt}</Text>
    <Text color="red">'{state.input}'</Text>
  </Text>;
}