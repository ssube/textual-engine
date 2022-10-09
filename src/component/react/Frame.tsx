import * as React from 'react';

import { HISTORY_SIZE, META_CREATE } from '../../util/constants.js';
import { FrameProps } from '../shared.js';
import { Input } from './Input.js';
import { Output } from './Output.js';
import { Quit } from './Quit.js';
import { Shortcuts } from './Shortcuts.js';
import { Status } from './Status.js';
import { Worlds } from './Worlds.js';

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
    {props.show.status && <Status stats={props.stats} />}
    {props.show.shortcuts && <Shortcuts
      {...props.shortcuts}
      onTarget={(id) => setLine(`${line} ${id}`)}
      onVerb={(verb) => setLine(verb)}
    />}
    <Worlds worlds={props.worlds} onClick={(id) => setLine(`${META_CREATE} ${id} with test seed and 10`)} />
  </div>;
};
