import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import * as React from 'react';

import { StepResult } from '../../service/state';
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

  return <Box flexDirection="column">
    <Box>
      <Output output={props.output.slice(-HISTORY_SIZE)} />
    </Box>
    <Box height={1}>
      <Box marginRight={1}>
        <Text color="blueBright">turn {props.step.turn} &gt;</Text>
      </Box>
      <TextInput
        onChange={setLine}
        onSubmit={() => {
          setLine('');
          props.onLine(line);
        }}
        value={line}
      />
    </Box>
  </Box>;
};
