import * as React from 'react';

interface OutputProps {
  output: Array<string>;
}

export const Output = (props: OutputProps) => {
  return <div>
    <div>Output: {props.output.length} lines</div>
    {props.output.map((line, idx) => <div key={idx}>{line}</div>)}
  </div>;
};
