import { Newline, Text, useApp, useInput } from 'ink';
import * as React from 'react';

import { InkQuitDispatch, InkState, InkStateDispatch } from '../../InkRender';
import { Output } from './Output';

const { useEffect, useState } = React;

interface FrameProps {
  onLine: InkStateDispatch;
  onQuit: InkQuitDispatch;
}

const HISTORY_SIZE = 20;
const DEFAULT_STATE: InkState = {
  input: '',
  prompt: '> ',
  output: [],
};

export const Frame = (props: FrameProps) => {
  const { exit } = useApp();
  const [state, setter] = useState(DEFAULT_STATE);

  useEffect(() => {
    const { pending, remove } = props.onQuit();

    pending.then(() => {
      exit();
    });

    return () => {
      remove();
    };
  });

  useInput((input, key) => {
    if (key.return) {
      const { pending, remove } = props.onLine(state.input);

      pending.then((stepState) => {
        const merged = [
          ...state.output, ...stepState.output
        ];
        setter({
          ...stepState,
          output: merged.slice(-HISTORY_SIZE),
        });
      });

      // TODO: when should onLine remove be called?
    } else if (key.backspace || key.delete) {
      setter({
        ...state,
        input: state.input.substr(0, state.input.length - 1),
      });
    } else {
      setter({
        ...state,
        input: state.input + input,
      });
    }
  });

  return <Text>
    <Newline />
    <Output output={state.output} />
    <Newline />
    <Text color="blueBright">{state.prompt}</Text>
    <Text color="red">{state.input}</Text>
  </Text>;
}