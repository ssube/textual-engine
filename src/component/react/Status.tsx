import * as React from 'react';
import { StatusProps } from '../shared.js';

export const Status = (props: StatusProps): JSX.Element => <div>
  {props.stats.map((it) => <div key={it.name}>{it.name}: {it.value}</div>)}
</div>;
