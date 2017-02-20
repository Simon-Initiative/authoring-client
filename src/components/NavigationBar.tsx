'use strict'

import * as React from 'react';

import { document } from '../actions/document';

interface NavigationBar {
  
}

export interface NavigationBarProps {
  documentActions: any;
}

class NavigationBar extends React.PureComponent<NavigationBarProps, {}> {

  render() {
    return (
      <header className="navbar">
        <section className="navbar-section">
            <a onClick={this.props.documentActions.viewAllCourses} 
              className="btn btn-link">My Courses</a>
        </section>
        
      </header>);
  }

}

export default NavigationBar;


