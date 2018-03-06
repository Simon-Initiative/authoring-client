import * as React from 'react';

import './ContentDecorator.scss';

export interface ContentDecoratorProps {
  onFocus: () => void;
  onRemove: () => void;
  isActiveContent: boolean;
}

export interface ContentDecoratorState {

}

export class ContentDecorator
  extends React.Component<ContentDecoratorProps, ContentDecoratorState> {

  constructor(props, childState) {
    super(props);

  }

  render() {

    const classes = 'content-decorator ' +
      (this.props.isActiveContent ? ' active-content' : '');

    return (
      <div className={classes} onFocus={this.props.onFocus}>
        {this.props.children}
      </div>
    );

  }

}
