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

  function sendLine(value: string): void {
    props.onLine(value);
    setLine('');
  }

  return <Box flexDirection="row">
    <Box flexDirection="column">
      <Box>
        <Output output={output} />
      </Box>
      <Box height={1}>
        {props.quit ? <Quit /> : <Input
          line={line}
          prompt={props.prompt}
          onChange={setLine}
          onLine={sendLine}
        />}
      </Box>
    </Box>
    <Box marginLeft={2}>
      {props.show.shortcuts && <Shortcuts
        {...props.shortcuts}
        onSelect={(id) => setLine(`${line} ${id}`)}
      />}
    </Box>
  </Box>;
};
