import * as React from 'react';
import guid from '../utils/guid';
import * as persistence from '../data/persistence';
import * as models from '../data/models';
import * as viewActions from '../actions/view';

import './CreateCourseView.scss';
import { Toast, Severity } from 'components/common/Toast';
import { CourseCreation } from 'components/CourseCreation';

export interface CreateCourseViewProps {
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
    const id = title.toLowerCase().split(' ')[0] + '-' + g.substring(g.lastIndexOf('-') + 1);
    const model = new models.CourseModel({ id, title, version: '1.0' });

    persistence.createDocument(null, model)
      .then((document) => {
        // Get an updated course content package payload
        if (document.model.modelType === models.ModelTypes.CourseModel) {
          this.props.dispatch(viewActions.viewCourse(document._courseId));
        }
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
    const waitingIcon = <i className="fa fa-circle-o-notch fa-spin fa-1x fa-fw" />;
    const waitingHeading = 'Setting up your course';
    const waitingContent = <p>We'll take you there as soon as it's ready.</p>;
    const waiting =
      <Toast
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
        icon={errorIcon}
        heading={errorHeading}
        content={errorContent}
        severity={Severity.Error} />;

    return (
      <CourseCreation
        title="What's your course called?"
        buttonLabel="Create Course"
        placeholder="e.g. https://svn.oli.cmu.edu/svn/content/biology/intro_biology/trunk/"
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
