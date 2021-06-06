import { Box, Text, useFocusManager } from 'ink';
import * as React from 'react';

import { HISTORY_SIZE } from '../../util/constants';
import { FrameProps } from '../shared';
import { Input } from './Input';
import { Output } from './Output';
import { Quit } from './Quit';
import { Shortcuts } from './Shortcuts';

const { useState } = React;

export const Frame = (props: FrameProps): JSX.Element => {
  const [line, setLine] = useState('');
  const output = props.output.slice(-HISTORY_SIZE);

  useFocusManager();

  function sendLine(line: string) {
    setLine('');
    props.onLine(line);
  }

  return <Box flexDirection="row">
    <Box flexDirection="column">
      <Box>
        <Output output={output} />
      </Box>
      <Box height={1}>
        <Box marginRight={1}>
          <Text color="blueBright">turn {props.step.turn} &gt;</Text>
        </Box>
        {props.quit ? <Quit /> : <Input
          line={line}
          onLine={sendLine}
          onChange={setLine}
        />}
      </Box>
    </Box>
    <Box marginLeft={2}>
      <Shortcuts
        {...props.shortcuts}
        onSelect={(id) => setLine(`${line} ${id}`)}
      />
    </Box>
  </Box>;
};
