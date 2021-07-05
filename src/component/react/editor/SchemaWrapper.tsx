import * as React from 'react';

interface ValueComponentProps<TValue> {
  data: TValue;
}

interface SchemaWrapperProps<TValue> {
  data: unknown;

  errors: () => Array<string>;
  schema: (it: unknown) => it is TValue;

  valueComponent: (props: ValueComponentProps<TValue>) => React.ReactElement;
}

export class SchemaWrapper<TValue> extends React.Component<SchemaWrapperProps<TValue>> {
  public renderErrors() {
    return <div>
      {this.props.errors().map((it) => <div>{it}</div>)}
    </div>;
  }

  public render() {
    if (this.props.schema(this.props.data)) {
      return <this.props.valueComponent data={this.props.data} />;
    } else {
      return this.renderErrors();
    }
  }
}
