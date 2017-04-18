import * as React from 'react';
import guid from '../../../utils/guid';

export interface Collapse {  
  id: string;
}

export interface CollapseProps {
  caption: string;
  details?: string;
}

export interface CollapseState {
  collapsed: boolean;
}

export class Collapse extends React.PureComponent<CollapseProps, CollapseState> {

  constructor(props) {
    super(props);

    this.id = guid();

    this.state = {
      collapsed: true
    }

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.setState({ collapsed: !this.state.collapsed});
  }

  render() {

    const collapsedOrNot = this.state.collapsed ? 'collapse' : 'collapse.show';
    let detailsLabel = null;
    if (this.props.details !== undefined && this.state.collapsed) {
      detailsLabel = this.props.details;
    }

    const indicator = this.state.collapsed ? '+' : '-';

    return (
      <div>
        <button onClick={this.onClick} type="button" className="btn btn-link">{this.props.caption} {indicator}</button>
        {detailsLabel}
        <div className={collapsedOrNot} id={this.id}>
          {this.props.children}
        </div>
      </div>
    );
  }
  
}

