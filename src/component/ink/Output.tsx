import { Newline, Text } from 'ink';
import * as React from 'react';

import { OutputProps } from '../shared.js';

export const Output = (props: OutputProps): JSX.Element => <Text>
  <Text>Output: {props.output.length} lines</Text>
  <Newline />
  {props.output.map((line, idx) => <Text key={idx}>
    <Text color="green">{line}</Text>
    <Newline />
  </Text>)}
</Text>;
