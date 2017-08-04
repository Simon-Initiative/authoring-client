import * as React from 'react';
import guid from '../../../utils/guid';

export interface OrgCollapse {  
  id: string;
}

export interface OrgCollapseProps {
  caption: string;
  
}

export interface OrgCollapseState {
  collapsed: boolean;
}

export class OrgCollapse extends React.PureComponent<OrgCollapseProps, OrgCollapseState> {

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
    

    const indicator = this.state.collapsed ? '+' : '-';

    return (
      <div style={ { display: 'inline-block', width: '100%' } }>
        

        <button onClick={this.onClick} type="button" 
          className="btn btn-link">{this.props.caption} {indicator}</button>
        
        <div className={collapsedOrNot} id={this.id}>
          {this.props.children}
        </div>
      </div>
    );
  }
  
}

