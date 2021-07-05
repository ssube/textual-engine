import * as React from 'react';

export interface ArrayEditorProps<TValue> {
  data: Array<TValue>;
  max: number;

  valueEditor: () => React.ReactElement;
}

export class ArrayEditor<TValue> extends React.Component<ArrayEditorProps<TValue>> {
  public render(): JSX.Element {
    return <div>Array of {this.props.data.length}</div>;
  }
}
