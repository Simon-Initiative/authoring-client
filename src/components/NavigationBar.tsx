import * as React from 'react';
import { returnType } from '../utils/types';
import { connect }  from 'react-redux';
import * as models from '../data/models';
import * as contentTypes from '../data/contentTypes';

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
export interface NavigationBarOwnProps {
  viewActions: any;
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
        paddingLeft: 0,
        paddingRight: 0,
        'position': 'fixed',
        top: '58px',
        bottom: 0,
        left: 0,
        zIndex: 1000,
        overflowX: 'hidden',
        overflowY: 'auto',
    }
};


function mapStateToProps(state: any) {

  const {
    course
  } = state;

  return {
    course
  }
}


const stateGeneric = returnType(mapStateToProps);  
type NavigationBarReduxProps = typeof stateGeneric; 
type NavigationBarProps = NavigationBarReduxProps & NavigationBarOwnProps & { dispatch };


/**
*
*/
class NavigationBar extends React.Component<NavigationBarProps, NavigationBarState> 
{    
     opts = [
                {
                    label: "Course Content",
                    icon: "C",
                    staticContent: false,
                    onclick: this.placeholderMenuHandler
                },
                {
                    label: "Content",          
                    staticContent: true,
                    onclick: this.placeholderMenuHandler     
                },     
                {
                    label: "Pages",
                    icon: "O",           
                    staticContent: false,
                    onclick: this.placeholderMenuHandler                        
                },
                { 
                    label: "Activities",
                    icon: "O",
                    staticContent: false,
                    onclick: this.placeholderMenuHandler                        
                },
                {
                    label: "Learning",          
                    staticContent: true,
                    onclick: this.placeholderMenuHandler                       
                },
                {
                    label: "Learning Objectives",
                    icon: "A",           
                    staticContent: false,
                    onclick: this.placeholderMenuHandler                        
                },
                {
                    label: "Skills",
                    icon: "A",           
                    staticContent: false,
                    onclick: this.placeholderMenuHandler                        
                },
                {
                    label: "Assets",          
                    staticContent: true,
                    onclick: this.placeholderMenuHandler
                },                
                {
                    label: "Media",
                    icon: "M",
                    staticContent: false,
                    onclick: this.placeholderMenuHandler
                },
                {
                    label: "Add-Ons",
                    icon: "L",
                    staticContent: false,
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
        this.setState({closed: true});
    }

    handleFoldOut(event: any) 
    {       
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
     * 
     */
    generateMenuItem (closed:boolean, item: any)
    {
        if (item.staticContent==true)
        {
            return (<h2 key={item.label}>{item.label}</h2>);
        }
                
        if (closed==true)
        {
           return (<li key={item.label} className="nav-item"><a className="nav-link" onClick={item.onclick}>{item.icon}</a></li>);
        } 

        return (<li key={item.label} className="nav-item"><a className="nav-link" onClick={item.onclick}>{item.label}</a></li>);   
    }
    
    /**
     * We included this dedicated menu generator to ensure we could insert main menu options
     * dynamically from external data and even from a marktplace (yes we can)
     */
    generateMenu (closed:boolean)
    {        
        return (this.opts.map(item => this.generateMenuItem (closed,item)));                
    }
         
    /**
     * Main render function
     */
    render() 
    {
        let menuControl = null;        
        let mStyle = null;

        const viewActivities = () => 
            this.props.viewActions.viewResources(
                this.props.course.courseId,
                'Activities',
                (resource) => resource.type === 'AssessmentModel',
                (title, courseId) => new models.AssessmentModel({
                    courseId,
                    title: new contentTypes.Title({ text: title})
                    })
            );

        const viewWorkbookPages = () => 
            this.props.viewActions.viewResources(
                this.props.course.courseId,
                'Workbook Pages',
                (resource) => resource.type === 'WorkbookPageModel',
                (title, courseId) => new models.WorkbookPageModel({
                    courseId,
                    head: new contentTypes.Head({ title: new contentTypes.Title({ text: title}) })
                    })
            );


        // Bad way of doing this, will be changed soon!
        this.opts [0].onclick=() => this.props.viewActions.viewDocument(this.props.course.organizationId);        
        this.opts [1].onclick=this.props.viewActions.viewAllCourses;
        this.opts [2].onclick = viewWorkbookPages;
        this.opts [3].onclick = viewActivities;
        
        this.opts [5].onclick=() => this.props.viewActions.viewDocument(this.props.course.LOId);
        this.opts [6].onclick=() => this.props.viewActions.viewDocument(this.props.course.skillsId);        
        
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
                <nav style={navbarStyles.sidebar} className="col-sm-3 col-md-2 hidden-xs-down sidebar">
                    <h1>Title of Course</h1>                    
                    <ul className="nav nav-pills flex-column">
                        {menuData}
                    </ul>
                </nav>
            );
    }
}

export default connect<NavigationBarReduxProps, {}, NavigationBarOwnProps>(mapStateToProps)(NavigationBar);
