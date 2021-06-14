import * as React from 'react';

import { InputProps } from '../shared';

export const Input = (props: InputProps): React.ReactElement => {
  function handleChange(event: any) {
    props.onChange(event.target.value);
  }

  function handleSubmit(event: any) {
    event.preventDefault();
    props.onLine(props.line);
  }

  return <form onSubmit={handleSubmit}>
    <label>{props.prompt} &gt;
      <input type="text" value={props.line} onChange={handleChange} />
    </label>
    <input type="submit" value="Go" />
  </form>;
};
