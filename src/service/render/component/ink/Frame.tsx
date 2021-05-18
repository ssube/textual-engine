import { doesExist } from '@apextoaster/js-utils';
import { Newline, Text, useApp, useInput } from 'ink';
import * as React from 'react';
import { StepResult } from '../../../state';

import { InkQuitDispatch, InkStateDispatch } from '../../InkRender';
import { Output } from './Output';

const { useEffect, useState } = React;

interface FrameProps {
  onLine: InkStateDispatch;
  onQuit: InkQuitDispatch;
}

const HISTORY_SIZE = 20;
const DEFAULT_STATE: StepResult = {
  line: '',
  output: [],
  stop: false,
  turn: 0,
  time: 0,
};

export const Frame = (props: FrameProps) => {
  const { exit } = useApp();
  const [line, setLine] = useState('');
  const [state, setState] = useState(DEFAULT_STATE);

  const pushError = (err?: Error) => {
    if (doesExist(err)) {
      setState({
        ...state,
        output: [
          ...state.output,
          err.message
        ].slice(-HISTORY_SIZE),
      });
    }
  };

  useEffect(() => {
    const { pending, remove } = props.onQuit();

    pending.then(() => {
      exit();
    }).catch(pushError);

    return () => {
      remove();
    };
  });

  useInput((input, key) => {
    if (key.return) {
      const { pending, remove } = props.onLine(line);

      pending.then((stepState) => {
        setLine('');
        setState({
          ...stepState,
          output: [
            ...state.output,
            ...stepState.output
          ].slice(-HISTORY_SIZE),
        });
      }).catch(pushError);

      // TODO: when should onLine remove be called?
      return remove;
    }

    if (key.backspace || key.delete) {
      setLine(line.substr(0, line.length - 1));
    } else {
      setLine(line + input);
    }

    return () => {/* noop */ };
  });

  return <Text>
    <Newline />
    <Output output={state.output} />
    <Newline />
    <Text color="blueBright">turn {state.turn} &gt; </Text>
    <Text color="red">{line}</Text>
  </Text>;
};
