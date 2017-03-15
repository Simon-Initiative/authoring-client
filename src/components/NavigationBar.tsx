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

function placeholderMenuHandler (props)
{
    console.log ("placeHolderMenuHanlder ()");
}

let options = [
                {
                    label: "My Courses",
                    icon: "C",
                    onclick: placeholderMenuHandler
                },
                {
                    label: "Outline Editor",
                    icon: "O",                            
                    onclick: placeholderMenuHandler                        
                },
                { 
                    label: "Learning Objectives",
                    icon: "O",                            
                    onclick: placeholderMenuHandler                        
                },
                {
                    label: "Activity Editor",
                    icon: "A",                            
                    onclick: placeholderMenuHandler                        
                },
                {
                    label: "Asset Manager",
                    icon: "M",                            
                    onclick: placeholderMenuHandler
                },
                {
                    label: "Analytics",
                    icon: "L",                            
                    onclick: placeholderMenuHandler                        
                }
              ]; 

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
    
    /**
     * We included this dedicated menu generator to ensure we could insert main menu options
     * dynamically from external data and even from a marktplace
     */
    generateMenu (closed:Boolean)
    {
        console.log ("generateMenu ("+closed+")");
        
        if (closed==true)
        {
           return ( options.map(item => <li key={item.label}><a onClick={item.onclick}>{item.icon}</a></li>));
        } 

        return (options.map(item => <li key={item.label}><a onClick={item.onclick}>{item.label}</a></li>));                
    }
         
    /**
     * Main render function
     */
    render() 
    {
        let menuControl = null;        
        let mStyle = null;
        
        options [0].onclick=this.props.documentActions.viewAllCourses;
        options [1].onclick=this.props.documentActions.viewOutlineEditor;
        
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
                <div style={mStyle as any}>
                    <div style={navbarStyles.mainMenu}>
                        <ul style={navbarStyles.verticalMenu}>{menuData}
                        </ul>
                    </div>
                    <div style={navbarStyles.bottomMenu}>                    
                        {menuControl}
                    </div>
                </div>
            );
    }
}
