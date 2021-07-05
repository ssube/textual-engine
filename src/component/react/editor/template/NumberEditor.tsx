import * as React from 'react';

import { TemplateNumber } from '../../../model/mapped/Template';

export interface NumberEditorProps {
  name: string;
  number: TemplateNumber;
}

export const NumberEditor = (props: NumberEditorProps): React.ReactElement => <div>
  <pre>{props.name}</pre>
  <input type="number" min={props.number.min} max={props.number.max} />
</div>;
