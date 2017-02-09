'use strict'

import * as React from 'react';

interface NavigationBar {
  
}

export interface NavigationBarProps {
  viewActions: any;
}

class NavigationBar extends React.PureComponent<NavigationBarProps, {}> {

  render() {
    return (
      <header className="navbar">
        <section className="navbar-section">
            
            <a onClick={this.props.viewActions.changeView.bind(undefined, 'allPages')} 
              className="btn btn-link">pages</a>
            <a onClick={this.props.viewActions.changeView.bind(undefined, 'allQuestions')}  
              className="btn btn-link">questions</a>
        </section>
        
      </header>);
  }

}

export default NavigationBar;


