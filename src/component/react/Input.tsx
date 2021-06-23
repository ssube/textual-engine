import * as React from 'react';

import { InputProps } from '../shared';

export const Input = (props: InputProps): React.ReactElement => {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    props.onChange(event.target.value);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    props.onLine(props.line);
  }

  return <form id="input-form" onSubmit={handleSubmit}>
    <label>{props.prompt} &gt;
      <input id="input-line" type="text" value={props.line} onChange={handleChange} />
    </label>
    <input id="input-submit" type="submit" value="Go" />
  </form>;
};
