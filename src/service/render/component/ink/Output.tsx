import { Newline, Text } from 'ink';
import * as React from 'react';

interface OutputProps {
  output: Array<string>;
}

export const Output = (props: OutputProps) => {
  return <Text>
    <Text>Output: {props.output.length} lines</Text>
    <Newline />
    {props.output.map((line, idx) => {
      return <Text key={idx}>
        <Text color="green">- {line}</Text>
        <Newline />
      </Text>;
    })}
  </Text>;
}