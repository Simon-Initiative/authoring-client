import * as React from 'react';
import * as Immutable from 'immutable';
import { returnType } from '../../utils/types';
import { connect } from 'react-redux';
import * as models from '../../data/models';
import * as contentTypes from '../../data/contentTypes';
import { Resource } from '../../data/content/resource';
import { buildFeedbackFromCurrent } from '../../utils/feedback';
import guid from '../../utils/guid';
import * as view from '../../actions/view';
import { Content } from './Content';

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

export interface NavigationBarProps {
  course: any;
  user: any;
  viewActions: any;
  onDispatch: (...args: any[]) => any;
}

export interface NavigationBarState {}

/**
 * NavigationBar React Component
 */
export default class NavigationBar extends React.Component<NavigationBarProps, NavigationBarState> {
  feedback: any;

  constructor(props) {
    super(props);

    this.feedback = null;
  }

  componentDidMount() {
    (window as any).$(this.feedback).tooltip();
  }

  componentWillUnmount() {
    (window as any).$(this.feedback).tooltip('hide');
  }

  render() {
    const { course, user } = this.props;

    const courseId = course.model && course.model.guid;

    const formUrl = buildFeedbackFromCurrent(
      user.profile.firstName + ' ' + user.profile.lastName,
      user.profile.email,
    );

    const title = course.model && course.model.title || '';

    return (
      <nav style={navbarStyles.sidebar as any}
        className="col-sm-3 col-md-2 hidden-xs-down sidebar">

        <h1>{title}</h1>
        <br/>
        <ul className="nav nav-pills flex-column">

          <Content label="Content Package"
            tooltip="Access course properties and permissions"
            onClick={() => view.viewDocument(courseId, courseId)}/>

          <Section label="Sequencing"/>
          <Content label="Organizations"
            tooltip="Arrange content for different applications"
            onClick={view.viewOrganizations.bind(undefined, courseId)}/>

          <Section label="Content"/>
          <Content label="Pages"
            tooltip="Create course learning material"
            onClick={view.viewPages.bind(undefined, courseId)}/>

          <Section label="Assessments"/>
          <Content label="Formative"
            tooltip="Create activities to monitor learning and provide feedback"
            onClick={view.viewFormativeAssessments.bind(undefined, courseId)}/>
          <Content label="Summative"
            tooltip="Create activities that evaluate student learning"
            onClick={view.viewSummativeAssessments.bind(undefined, courseId)}/>
          <Content label="Question Pools"
            tooltip="Create reusable collections of questions"
            onClick={view.viewPools.bind(undefined, courseId)}/>

          <Section label="Learning"/>
          <Content label="Objectives"
            tooltip="Define outcomes that students will reach"
            onClick={view.viewObjectives.bind(undefined, courseId)}/>
        </ul>

        <br/>

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
