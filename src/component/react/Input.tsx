import * as React from 'react';

import { InputProps } from '../shared';

export const Input = (props: InputProps) => {
  function handleChange(event: any) {
    props.onChange(event.target.value);
  }

  function handleSubmit(event: any) {
    event.preventDefault();
    props.onLine(event.target.value);
  }

  return <form onSubmit={handleSubmit}>
    <label>{props.prompt} &gt;
      <input type="text" value={props.line} onChange={handleChange} />
    </label>
    <input type="submit" value="Go" />
  </form>;
};
