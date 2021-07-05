import * as React from 'react';

import { ArrayEditor } from './collection/ArrayEditor';
import { PathBar } from './path/PathBar';
import { WorldEditor } from './WorldEditor';

export const DataEditor = (): React.ReactElement => <div>
  <PathBar />
  <ArrayEditor data={[]} max={10} valueEditor={WorldEditor} />
</div>;
