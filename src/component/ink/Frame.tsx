import { doesExist } from '@apextoaster/js-utils';
import { Newline, Text, useInput } from 'ink';
import * as React from 'react';

import { StepResult } from '../../service/state';
import { AbortEventError } from '../../util/event';
import { Output } from './Output';

const { useState } = React;

interface FrameProps {
  onLine: (line: string) => void;
  prompt: string;
  output: Array<string>;
  step: StepResult;
}

const HISTORY_SIZE = 20;

export const Frame = (props: FrameProps) => {
  const [line, setLine] = useState('');
  const [output, setOutput] = useState(props.output);

  const pushError = (err?: Error) => {
    if (doesExist(err) && (err instanceof AbortEventError) === false) {
      setOutput([
        ...output,
        err.message
      ].slice(-HISTORY_SIZE));
    }
  };

  useInput((input, key) => {
    if (key.return) {
      setLine('');
      props.onLine(line);
      return;
    }

    if (key.backspace || key.delete) {
      setLine(line.substr(0, line.length - 1));
    } else {
      setLine(line + input);
    }
  });

  return <Text>
    <Newline />
    <Output output={output.slice(-HISTORY_SIZE)} />
    <Newline />
    <Text color="blueBright">turn {props.step.turn} &gt; </Text>
    <Text color="red">{line}</Text>
  </Text>;
};
