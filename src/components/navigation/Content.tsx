import * as React from 'react';


export interface Content {
  ref;
}

export interface ContentProps {
  label: string;
  onClick: () => void;
  tooltip: string;
}

export interface ContentState {
  
}

export class Content 
  extends React.PureComponent<ContentProps, ContentState> {
    
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    (window as any).$(this.ref).tooltip(
      { delay: { show: 1000, hide: 100 } },
    );
  }

  componentWillUnmount() {
    (window as any).$(this.ref).tooltip('hide');
  }

  render() : JSX.Element {
    return (
      <li key={this.props.label} className="nav-item">
        <a 
          className="nav-link" 
          ref={a => this.ref = a}
          data-toggle="tooltip" 
          title={this.props.tooltip}
          onClick={this.props.onClick}>
          {this.props.label}
        </a>
      </li>
    );
    
  }

}

