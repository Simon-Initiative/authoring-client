import * as React from 'react';
import * as Immutable from 'immutable';
import { returnType } from '../utils/types';
import { connect } from 'react-redux';
import * as models from '../data/models';
import * as contentTypes from '../data/contentTypes';
import { Resource } from '../data/content/resource';
import guid from '../utils/guid';
import * as view from '../actions/view';
/**
 *
 */
interface NavigationBarState {
  
}

/**
 *
 */
export interface NavigationBarOwnProps {
  viewActions: any;
}


// Nick, do whatever you feel you have to here
const navbarStyles =
  {
    openMenu: {
      width: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      alignContent: 'stretch',
      height: 'inherit',
      borderRight: '1px solid grey',
    },
    closedMenu: {
      width: '64px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      alignContent: 'stretch',
      height: 'inherit',
      borderRight: '1px solid grey',
    },
    mainMenu: {
      flex: 'none',
      flexGrow: 1,
      order: 0,
      border: '0px solid #c4c0c0',
      padding: '0px',
      margin: '0 0 0 0',
    },
    verticalMenu: {
      listStyleType: 'none',
    },
    bottomMenu: {
      margin: '0 0 0 14px',
      height: '24px',
    },
    sidebar: {
      paddingLeft: 0,
      paddingRight: 0,
      paddingBottom: '20px',
      bottom: 0,
      left: 0,
      zIndex: 1000,
      overflowX: 'hidden',
      overflowY: 'auto',
    },
  };

// tslint:disable-next-line
const Section = (props) => {
  return <h2 key={props.label}>{props.label}</h2>;
};

// tslint:disable-next-line
const Content = (props) => {
  return (
    <li key={props.label} className="nav-item">
      <a className="nav-link" onClick={props.onClick}>
        {props.label}
      </a>
    </li>
  );
};


function mapStateToProps(state: any) {

  const {
    course,
  } = state;

  return {
    course,
  };
}


const stateGeneric = returnType(mapStateToProps);
type NavigationBarReduxProps = typeof stateGeneric;
type NavigationBarProps = NavigationBarReduxProps & NavigationBarOwnProps & { dispatch };


/**
 *
 */
class NavigationBar extends React.Component<NavigationBarProps, NavigationBarState> {
  
  constructor(props) {
    super(props);
  }

  render() {
    
    const courseId = this.props.course.model.guid;
    
    const title = this.props.course === null 
      || this.props.course === undefined
      ? '' 
      : this.props.course.model.title;

    return (
      <nav style={navbarStyles.sidebar as any} 
        className="col-sm-3 col-md-2 hidden-xs-down sidebar">
        
        <h1>{title}</h1>
        <br/>
        <ul className="nav nav-pills flex-column">
          
          <Content label="Content Package"
            onClick={() => view.viewDocument(courseId, courseId)}/>

          <Section label="Sequencing"/>
          <Content label="Organizations"
            onClick={view.viewOrganizations.bind(undefined, courseId)}/>

          <Section label="Content"/>
          <Content label="Pages"
            onClick={view.viewPages.bind(undefined, courseId)}/>
          
          <Section label="Assessments"/>
          <Content label="Formative"
            onClick={view.viewAssessments.bind(undefined, courseId)}/>
          <Content label="Summative"
            onClick={view.viewAssessments.bind(undefined, courseId)}/>
          <Content label="Question Pools"
            onClick={view.viewPools.bind(undefined, courseId)}/>
          
          <Section label="Learning"/>
          <Content label="Objectives"
            onClick={view.viewObjectives.bind(undefined, courseId)}/>
        </ul>
      </nav>
    );
  }
}

export default connect<NavigationBarReduxProps, {}, NavigationBarOwnProps>
  (mapStateToProps)(NavigationBar);
