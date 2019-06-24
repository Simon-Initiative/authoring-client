import * as React from 'react';
import guid from '../../../utils/guid';

export interface Collapse {
  id: string;
}

export interface CollapseProps {
  caption: string;
  details?: string;
  expanded?: any; // Component to display in place of details when expanded
  parentClass?: string; // any class name to be passed down to the parent component
  buttonClass?: string; // any class name to be passed down to the the button
  buttonSibling?: JSX.Element; // this is super-hacky... the button is class="col-3", and if
                               // we don't put it next to a div with class="col-9", it shows up
                               // as a gray bar. I'm not sure this would be useful for
                               // future implementations
}

export interface CollapseState {
  collapsed: boolean;
}

export class Collapse extends React.PureComponent<CollapseProps, CollapseState> {

  constructor(props) {
    super(props);

    this.id = guid();

    this.state = {
      collapsed: true,
    };

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.setState({ collapsed: !this.state.collapsed });
  }

  render() {

    const collapsedOrNot = this.state.collapsed ? 'collapse' : 'collapse.show';
    let detailsOrExpanded = null;
    if (this.props.details !== undefined && this.state.collapsed) {
      detailsOrExpanded = this.props.details;
    } else if (this.props.expanded !== undefined && !this.state.collapsed) {
      detailsOrExpanded = this.props.expanded;
    }

    const indicator = this.state.collapsed ? '+' : '-';

    return (
      <div className={this.props.parentClass}>

        <button
          onClick={this.onClick}
          type="button"
          className={"btn btn-link " + this.props.buttonClass}>
          {this.props.caption} {indicator}
        </button>
        {this.props.buttonSibling}
        {detailsOrExpanded}
        <div className={collapsedOrNot} id={this.id}>
          {this.props.children}
        </div>
      </div>
    );
  }

}

