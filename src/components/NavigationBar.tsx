import * as React from 'react';
import MainMenuCollapse;

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
class NavigationBar extends React.PureComponent<NavigationBarProps, {}> 
{
  render() 
  {
    return (
    		<div style={{"display": "flex", flexDirection: 'column', justifyContent: 'space-between', alignItems: 'stretch',  alignContent: 'stretch', height: "inherit", "borderRight" : "1px solid grey"}}>
				<div style={{flex: "none", flexGrow: 1, order: 0, border: "0px solid #c4c0c0", padding: "0px", margin: "0 0 0 0"}}>
		    		<ul className="unstyled">
		    			<li><a onClick={this.props.documentActions.viewAllCourses} className="btn btn-link">My Courses</a></li>
		    			<li><a onClick={this.props.documentActions.viewOutlineEditor} className="btn btn-link">Outline Editor</a></li>
		    			<li><a className="btn btn-link">Learning Objectives</a></li>
		    			<li><a className="btn btn-link">Activity Editor</a></li>
		    			<li><a className="btn btn-link">Asset Manager</a></li>
		    			<li><a className="btn btn-link">Analytics</a></li>
					</ul>
				</div>
				<div style={{margin: "0 0 0 14px", height: "24px"}}>
					<MainMenuCollapse />
				</div>
			</div>
      );
  }
}

export default NavigationBar;
