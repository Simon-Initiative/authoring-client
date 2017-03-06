import * as React from 'react';

/**
*
*/
interface NavigationBar {
}

/**
*
*/
export interface NavigationBarProps {
  documentActions: any;
}

/**
*
*/
class NavigationBar extends React.PureComponent<NavigationBarProps, {}> {
  render() {
    return (
    		<ul className="unstyled">
    			<li><a onClick={this.props.documentActions.viewAllCourses} className="btn btn-link">My Courses</a></li>
    			<li><a className="btn btn-link">Outline Editor</a></li>
    			<li><a className="btn btn-link">Learning Objectives</a></li>
    			<li><a className="btn btn-link">Activity Editor</a></li>
    			<li><a className="btn btn-link">Asset Manager</a></li>
    			<li><a className="btn btn-link">Analytics</a></li>
			</ul>			
      );
  }
}

export default NavigationBar;
