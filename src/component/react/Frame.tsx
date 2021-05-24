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

  function handleChange(event: any) {
    setLine(event.target.value);
  }

  function handleSubmit(event: any) {
    event.preventDefault();
    props.onLine(line);
    setLine('');
  }

  return <div style={{
    fontFamily: 'monospace',
  }}>
    <Output output={props.output.slice(-HISTORY_SIZE)} />
    <div>
      <form onSubmit={handleSubmit}>
        <label>turn {props.step.turn} &gt;
          <input type="text" value={line} onChange={handleChange} />
        </label>
        <input type="submit" value="Go" />
      </form>
    </div>
  </div>;
};
