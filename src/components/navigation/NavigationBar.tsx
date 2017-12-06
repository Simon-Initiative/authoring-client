import * as React from 'react';
import * as Immutable from 'immutable';
import { connect } from 'react-redux';
import * as models from '../../data/models';
import * as contentTypes from '../../data/contentTypes';
import { Resource } from '../../data/content/resource';
import guid from '../../utils/guid';
import * as view from '../../actions/view';
import { Content } from './Content';

import './NavigationBar.scss';

// tslint:disable-next-line
const Section = (props) => {
  return <h2 key={props.label}>{props.label}</h2>;
};

export interface NavigationBarProps {
  course: models.CourseModel;
  user: any;
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
    const { course, user, onDispatch } = this.props;

    const courseId = course && course.guid;


    const title = course && course.title || '';

    return (
      <nav className="navigation-bar col-sm-3 col-md-2 hidden-xs-down sidebar">
        <h1>{title}</h1>
        <br/>
        <ul className="nav nav-pills flex-column">
          <Content label="Content Package"
            tooltip="Access course properties and permissions"
            onClick={() => onDispatch(view.viewDocument(courseId, courseId))}/>

          <Section label="Sequencing"/>
          <Content label="Organizations"
            tooltip="Arrange content for different applications"
            onClick={() => onDispatch(view.viewOrganizations(courseId))}/>

          <Section label="Content"/>
          <Content label="Pages"
            tooltip="Create course learning material"
            onClick={() => onDispatch(view.viewPages(courseId))}/>

          <Section label="Assessments"/>
          <Content label="Formative"
            tooltip="Create activities to monitor learning and provide feedback"
            onClick={() => onDispatch(view.viewFormativeAssessments(courseId))}/>
          <Content label="Summative"
            tooltip="Create activities that evaluate student learning"
            onClick={() => onDispatch(view.viewSummativeAssessments(courseId))}/>
          <Content label="Question Pools"
            tooltip="Create reusable collections of questions"
            onClick={() => onDispatch(view.viewPools(courseId))}/>

          <Section label="Learning"/>
          <Content label="Objectives"
            tooltip="Define outcomes that students will reach"
            onClick={() => onDispatch(view.viewObjectives(courseId))}/>
        </ul>

      </nav>
    );
  }
}
