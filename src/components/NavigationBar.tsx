import * as React from 'react';
import * as Immutable from 'immutable';
import { returnType } from '../utils/types';
import { connect } from 'react-redux';
import * as models from '../data/models';
import * as contentTypes from '../data/contentTypes';
import { Resource } from '../data/content/resource';
import { buildFeedbackFromCurrent } from '../utils/feedback';
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
    user,
  } = state;

  return {
    course,
    user,
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

    this.feedback = null;
  }

  feedback: any;


  componentDidMount() {
    (window as any).$(this.feedback).tooltip();
  }

  componentWillUnmount() {
    (window as any).$(this.feedback).tooltip('hide');
  }

  render() {
    
    const courseId = this.props.course.model.guid;

    const formUrl = buildFeedbackFromCurrent(
      this.props.user.profile.firstName + ' ' + this.props.user.profile.lastName,
      this.props.user.profile.email);
    
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
            onClick={view.viewFormativeAssessments.bind(undefined, courseId)}/>
          <Content label="Summative"
            onClick={view.viewSummativeAssessments.bind(undefined, courseId)}/>
          <Content label="Question Pools"
            onClick={view.viewPools.bind(undefined, courseId)}/>
          
          <Section label="Learning"/>
          <Content label="Objectives"
            onClick={view.viewObjectives.bind(undefined, courseId)}/>
        </ul>

        <ul className="nav nav-pills flex-column feedback">
          <li><a target="_blank" 
            ref={a => this.feedback = a}
            data-toggle="tooltip" title="Report a problem or suggest improvements"
            href={formUrl}>Feedback</a></li>
        </ul>

      </nav>
    );
  }
}

export default connect<NavigationBarReduxProps, {}, NavigationBarOwnProps>
  (mapStateToProps)(NavigationBar);
