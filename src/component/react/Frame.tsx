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

  function sendLine(value: string) {
    props.onLine(value);
    setLine('');
  }

  return <div style={{
    fontFamily: 'monospace',
  }}>
    <Output output={output} />
    <div>
      {props.quit ? <Quit /> : <Input
        line={line}
        prompt={props.prompt}
        onChange={setLine}
        onLine={sendLine}
      /> }
    </div>
    {props.show.shortcuts && <Shortcuts {...props.shortcuts} onSelect={(id) => setLine(`${line} ${id}`)} />}
  </div>;
};
