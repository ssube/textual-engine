import * as React from 'react';

export interface MapEditorProps<TValue> {
  data: Map<string, TValue>;
  max: number;
}

export class MapEditor<TValue> extends React.Component<MapEditorProps<TValue>> {
  public render(): JSX.Element {
    return <div>Map of {this.props.data.size}</div>;
  }
}
