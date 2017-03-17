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

/**
 * 
 */
function FoldInButton(props) 
{
  return (
    <a href="#" onClick={props.onClick}>Collapse Menu</a>
  );
}

/**
 * 
 */
function FoldOutButton(props) 
{
  return (
    <a href="#" onClick={props.onClick}>Open</a>
  );
}

// Nick, do whatever you feel you have to here
const navbarStyles=
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
        listStyleType : 'none'
    },
    bottomMenu:
    {
        margin: "0 0 0 14px",
        height: "24px"
    },
    sidebar: {
        'padding-left': 0,
        'padding-right': 0,
        'position': 'fixed',
        top: '51px',
        bottom: 0,
        left: 0,
        'z-index': 1000,
        'overflow-x': 'hidden',
        'overflow-y': 'auto',
        'border-right': '1px solid #eee'
    }
};

/**
*
*/
export default class NavigationBar extends React.Component<NavigationBarProps, NavigationBarState> 
{    
     opts = [
                {
                    label: "My Courses",
                    icon: "C",
                    onclick: this.placeholderMenuHandler
                },
                {
                    label: "Outline Editor",
                    icon: "O",                            
                    onclick: this.placeholderMenuHandler                        
                },
                { 
                    label: "Learning Objectives",
                    icon: "O",                            
                    onclick: this.placeholderMenuHandler                        
                },
                {
                    label: "Activity Editor",
                    icon: "A",                            
                    onclick: this.placeholderMenuHandler                        
                },
                {
                    label: "Asset Manager",
                    icon: "M",                            
                    onclick: this.placeholderMenuHandler
                },
                {
                    label: "Analytics",
                    icon: "L",                            
                    onclick: this.placeholderMenuHandler                        
                }
              ];
    
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
    
    /**
     * 
     */
    placeholderMenuHandler (props)
    {
        console.log ("placeHolderMenuHanlder ()");
    }    
    
    /**
     * We included this dedicated menu generator to ensure we could insert main menu options
     * dynamically from external data and even from a marktplace (yes we can)
     */
    generateMenu (closed:Boolean)
    {
        console.log ("generateMenu ("+closed+")");
        
        if (closed==true)
        {
           return (this.opts.map(item => <li key={item.label}><a onClick={item.onclick}>{item.icon}</a></li>));
        } 

        return (this.opts.map(item => <li key={item.label}><a onClick={item.onclick}>{item.label}</a></li>));        
    }
         
    /**
     * Main render function
     */
    render() 
    {
        let menuControl = null;        
        let mStyle = null;
        
        // Bad way of doing this, will be changed soon!
        this.opts [0].onclick=this.props.documentActions.viewAllCourses;
        this.opts [1].onclick=this.props.documentActions.viewOutlineEditor;
        
        if (this.state.closed==true) 
        {
            menuControl = <FoldOutButton onClick={ e => this.handleFoldOut(e) } />;
            mStyle = navbarStyles.closedMenu as any;
        }
        else 
        {
            menuControl = <FoldInButton onClick={ e => this.handleFoldIn(e) } />;
            mStyle = navbarStyles.openMenu as any;
        }
        
        let menuData=this.generateMenu(this.state.closed);
        
        return (
                <nav style={navbarStyles.sidebar} className="col-sm-3 col-md-2 hidden-xs-down bg-faded sidebar">
                    <ul className="nav nav-pills flex-column">
                    {menuData}
                    </ul>
                    {/*  
                    <ul className="nav nav-pills flex-column">
                        <li className="nav-item">                    
                            {menuControl}
                        </li>
                    </ul>
                    */}
                </nav>
            );
    }
}
