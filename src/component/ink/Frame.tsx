import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import * as React from 'react';

import { StepResult } from '../../service/state';
import { HISTORY_SIZE } from '../../util/constants';
import { Output } from './Output';
import { Quit } from './Quit';
import { Shortcuts } from './Shortcuts';

const { useState } = React;

interface FrameProps {
  onLine: (line: string) => void;
  prompt: string;
  output: Array<string>;
  step: StepResult;
  quit: boolean;
}

export const Frame = (props: FrameProps): JSX.Element => {
  const [line, setLine] = useState('');
  const output = props.output.slice(-HISTORY_SIZE);

  return <Box flexDirection="row">
    <Box flexDirection="column">
      <Box>
        <Output output={output} />
      </Box>
      <Box height={1}>
        <Box marginRight={1}>
          <Text color="blueBright">turn {props.step.turn} &gt;</Text>
        </Box>
        {props.quit ? <Quit /> : <TextInput
          onChange={setLine}
          onSubmit={() => {
            setLine('');
            props.onLine(line);
          }}
          value={line}
        />}
      </Box>
    </Box>
    <Box>
      <Shortcuts />
    </Box>
  </Box>;
};
