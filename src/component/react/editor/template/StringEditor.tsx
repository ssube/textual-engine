import * as React from 'react';

import { TemplateString } from '../../../model/mapped/Template';

export interface StringEditorProps {
  name: string;
  string: TemplateString;
}

export const StringEditor = (props: StringEditorProps): React.ReactElement => <div>
  <pre>{props.name}</pre>
  <input value={props.string.base} />
</div>;
