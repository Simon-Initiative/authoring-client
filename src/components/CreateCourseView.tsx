import * as React from 'react';
import guid from '../utils/guid';
import * as persistence from '../data/persistence';
import * as models from '../data/models';
import * as viewActions from '../actions/view';
import { isNullOrUndefined } from 'util';

import './CreateCourseView.scss';
import { buildFeedbackFromCurrent } from 'utils/feedback';
import { Toast, Severity } from 'components/common/Toast';

const BOOK_IMAGE = require('../../assets/book.svg');

export interface CreateCourseViewProps {
  dispatch: any;
}

export interface CreateCourseViewState {
  waiting: boolean;
  error: boolean;
  disabled: boolean;
  inputText: string;
}

class CreateCourseView extends React.PureComponent<CreateCourseViewProps, CreateCourseViewState> {

  constructor(props) {
    super(props);

    this.state = {
      waiting: false,
      error: false,
      disabled: true,
      inputText: '',
    };

    this.onChange = this.onChange.bind(this);
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

  onChange(e) {
    const value: string = e.target.value;

    this.setState({
      inputText: value,
      disabled: value.trim() === '',
    });
  }

  createCourse(e) {
    e.preventDefault();

    this.setState({ waiting: true }, () => this.startCreation(this.state.inputText.trim()));
  }

  render() {

    const button = (
      <div className="col-md-6 offset-sm-3">
        <div className="creationContainer">
          <button disabled={this.state.disabled}
            onClick={this.createCourse.bind(this)}>
            Create Course
        </button>
        </div>
      </div>
    );

    const waitingIcon = <i className="fa fa-circle-o-notch fa-spin fa-1x fa-fw" />;
    const waitingHeading = 'Setting up your course';
    const waitingContent = <p>We'll take you there as soon as it's ready.</p>;
    const waiting = (
      <div className="col-md-6 offset-sm-3">
        <Toast
          icon={waitingIcon}
          heading={waitingHeading}
          content={waitingContent}
          severity={Severity.Waiting} />
      </div>
    );

    const errorIcon = <i className="fa fa-exclamation-circle" />;
    const errorHeading = 'Oops';
    const errorContent = <p>Something went wrong. Please try again, and
    if the problem remains you can contact us with the link below.</p>;
    const error = (
      <div className="col-md-6 offset-sm-3">
        <Toast
          icon={errorIcon}
          heading={errorHeading}
          content={errorContent}
          severity={Severity.Error} />
      </div>
    );

    return (
      <div className="create-course-view full container-fluid">
        <div className="row">
          <div className="col-md-4 offset-sm-4">
            <h2>What's your course called?</h2>
          </div>
        </div>
        <div className="row">
          <fieldset>
            <input
              value={this.state.inputText}
              onChange={this.onChange}
              type="text"
              id="input"
              placeholder="e.g. Introduction to Psychology, Spanish I" />
          </fieldset>
        </div>
        <div className="row">
          {button}
          {this.state.waiting
            ? waiting
            : this.state.error
              ? error
              : null}
        </div>
      </div>
    );
  }
}

export default CreateCourseView;


