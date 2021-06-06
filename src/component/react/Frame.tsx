import * as React from 'react';

import { StepResult } from '../../service/state';
import { HISTORY_SIZE } from '../../util/constants';
import { Output } from './Output';
import { Quit } from './Quit';
import { Shortcuts } from './Shortcuts';

const { useState } = React;

interface FrameProps {
  onLine: (line: string) => void;
  output: Array<string>;
  prompt: string;
  quit: boolean;
  step: StepResult;
}

export const Frame = (props: FrameProps): JSX.Element => {
  const [line, setLine] = useState('');
  const output = props.output.slice(-HISTORY_SIZE);

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
    <Output output={output} />
    <div>
      {props.quit ? <Quit /> : <form onSubmit={handleSubmit}>
        <label>turn {props.step.turn} &gt;
          <input type="text" value={line} onChange={handleChange} />
        </label>
        <input type="submit" value="Go" />
      </form>}
    </div>
    <Shortcuts />
  </div>;
};
