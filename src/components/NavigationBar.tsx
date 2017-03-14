/**
*
*/
import * as React from 'react';

/**
*
*/
interface NavigationBarState 
{
   closed: boolean
}

/**
*
*/
export interface NavigationBarProps 
{
  documentActions: any;
}

function FoldInButton(props) 
{
  return (
    <a href="#" onClick={props.onClick}>Collapse Menu</a>
  );
}

function FoldOutButton(props) 
{
  return (
    <a href="#" onClick={props.onClick}>Open</a>
  );
}

// Nick, do whatever you feel you have to here
const styles=
{
    openMenu:
    {
        width: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        alignContent: 'stretch',
        height: 'inherit',
        borderRight : '1px solid grey'
    },
    closedMenu:
    {
        width: '64px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        alignContent: 'stretch',
        height: 'inherit',
        borderRight : '1px solid grey'
    },
    mainMenu:
    {
        flex: "none",
        flexGrow: 1,
        order: 0,
        border: "0px solid #c4c0c0",
        padding: "0px",
        margin: "0 0 0 0"        
    },
    verticalMenu:
    {
        'list-style-type': 'none'
    },
    bottomMenu:
    {
        margin: "0 0 0 14px",
        height: "24px"
    }
};

/**
*
*/
export default class NavigationBar extends React.Component<NavigationBarProps, NavigationBarState> 
{
    constructor(props) 
    {     
        super(props);
        this.state={closed: false};
    }

    handleFoldIn(event: any) 
    {
        console.log ("handleFoldIn()");
        this.setState({closed: true});
    }

    handleFoldOut(event: any) 
    {
        console.log ("handleFoldOut()");
        this.setState({closed: false});
    }    
         
    render() 
    {
        let menuControl = null;
        
        console.log (this.state.closed);
        
        if (this.state.closed==true) 
        {
            menuControl = <FoldOutButton onClick={ e => this.handleFoldOut(e) } />;
        }
        else 
        {
            menuControl = <FoldInButton onClick={ e => this.handleFoldIn(e) } />;
        }
        
        if (this.state.closed==false)
        {        
        return (
                <div style={styles.openMenu as any}>
                    <div style={styles.mainMenu}>
                        <ul style={styles.verticalMenu}>
                            <li><a onClick={this.props.documentActions.viewAllCourses}>My Courses</a></li>
                            <li><a onClick={this.props.documentActions.viewOutlineEditor}>Outline Editor</a></li>
                            <li><a>Learning Objectives</a></li>
                            <li><a>Activity Editor</a></li>
                            <li><a>Asset Manager</a></li>
                            <li><a>Analytics</a></li>
                        </ul>
                    </div>
                    <div style={styles.bottomMenu}>                    
                        {menuControl}
                    </div>
                </div>
            );
        }        
        
        return (
    		<div style={styles.closedMenu as any}>
				<div style={styles.mainMenu}>
		    		 <ul style={styles.verticalMenu}>
		    			<li><a onClick={this.props.documentActions.viewAllCourses}>C</a></li>
		    			<li><a onClick={this.props.documentActions.viewOutlineEditor}>E</a></li>
		    			<li><a>O</a></li>
		    			<li><a>A</a></li>
		    			<li><a>M</a></li>
		    			<li><a>L</a></li>
					</ul>
				</div>
				<div style={styles.bottomMenu}>
                    {menuControl}
				</div>
			</div>
        );
    }
}
