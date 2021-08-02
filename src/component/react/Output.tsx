import * as React from 'react';

import { OutputProps } from '../shared.js';

export const Output = (props: OutputProps): JSX.Element => <div>
  <div>Output: {props.output.length} lines</div>
  {props.output.map((line, idx) => <div key={idx}>{line}</div>)}
</div>;
