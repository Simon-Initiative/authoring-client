import * as React from 'react';
import guid from '../utils/guid';
import * as persistence from '../data/persistence';
import * as models from '../data/models';
import * as viewActions from '../actions/view';

import './CreateCourseView.scss';
import { Toast, Severity } from 'components/common/Toast';
import { CourseCreation } from 'components/CourseCreation';
import { buildAggregateModel } from './objectives/persistence';
import { CourseIdVers, CourseGuid } from 'data/types';
import { Maybe } from 'tsmonad';

export interface CreateCourseViewProps {
  userName: string;
  dispatch: any;
}

export interface CreateCourseViewState {
  waiting: boolean;
  error: boolean;
}

class CreateCourseView extends React.PureComponent<CreateCourseViewProps, CreateCourseViewState> {

  constructor(props) {
    super(props);

    this.state = {
      waiting: false,
      error: false,
    };

    this.createCourse = this.createCourse.bind(this);
  }

  startCreation(title: string) {
    const g = guid();
    const id = (title.toLowerCase().split(' ')[0]
      // replace non-alphanumberic chars
      .replace(/[\W_]+/g, '')
      // slice to prevent id size errors in db
      .slice(0, 16)
      + '-' + g.substring(g.lastIndexOf('-') + 1))
      .slice(0, 20);

    const model = new models.CourseModel({
      guid: CourseGuid.of(g), id, title, version: '1.0', idvers: CourseIdVers.of(id, '1.0'),
    });

    persistence.createPackage(model)
      .then((course) => {
        viewActions.viewCourse(course.idvers, Maybe.nothing());
        return buildAggregateModel(course.idvers, this.props.userName);
      })
      .catch((err) => {
        this.setState({ waiting: false, error: true });
      });
  }

  createCourse(inputText: string) {
    this.setState(
      { waiting: true },
      () => this.startCreation(inputText),
    );
  }

  render() {
    const waitingIcon = <i className="fas fa-circle-notch fa-spin fa-1x fa-fw" />;
    const waitingHeading = 'Setting up your course';
    const waitingContent = <p>We'll take you there as soon as it's ready.</p>;
    const waiting =
      <Toast
        style={{ width: 600 }}
        icon={waitingIcon}
        heading={waitingHeading}
        content={waitingContent}
        severity={Severity.Waiting} />;

    const errorIcon = <i className="fa fa-exclamation-circle" />;
    const errorHeading = 'Oops';
    const errorContent = <p>Something went wrong. Please try again, and
    if the problem remains you can contact us with the link in the bottom left.</p>;
    const error =
      <Toast
        style={{ width: 600 }}
        icon={errorIcon}
        heading={errorHeading}
        content={errorContent}
        severity={Severity.Error} />;

    return (
      <CourseCreation
        title="What's your course called?"
        placeholder="e.g. Introduction to Psychology, Spanish I"
        buttonLabel="Create Course"
        submitted={this.state.waiting}
        toast={this.state.waiting
          ? waiting
          : this.state.error
            ? error
            : null}
        onSubmit={this.createCourse}
      />
    );
  }
}

export default CreateCourseView;
