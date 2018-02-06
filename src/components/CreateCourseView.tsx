import * as React from 'react';
import guid from '../utils/guid';
import * as persistence from '../data/persistence';
import * as models from '../data/models';
import * as viewActions from '../actions/view';
import { isNullOrUndefined } from 'util';

import './CreateCourseView.scss';

const BOOK_IMAGE = require('../../assets/book.svg');

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

  createCourse(e) {
    e.preventDefault();

    const title = (this.refs['title'] as any).value;
    if (isNullOrUndefined(title) || title === '') {
      return;
    }

    this.setState({ waiting: true }, () => this.startCreation(title));
  }

  render() {

    const inputs = (
      <div className="col-md-4 offset-sm-4">
        <button onClick={this.createCourse.bind(this)}
                className="btn btn-secondary btn-lg btn-block outline serif">
          Create Course
        </button>
      </div>
    );

    const waiting = (
      <div className="col-md-4 offset-sm-4">
        <div className="alert alert-info" role="alert">
          <h4 className="alert-heading">Course Creation in Progress</h4>
          <p>A new course is being created for you. </p>
          <p className="mb-0">Upon completion of the course creation you will
            be taken to the front page of the new course.
          </p>
        </div>
      </div>
    );

    const error = (
      <div className="col-md-4 offset-sm-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>A problem was encountered trying to create the new course</p>
          <p className="mb-0">Please try again, if the problem persists please
            contact support.
          </p>
        </div>
      </div>
    );

    const imageViaStyle = {
      backgroundImage: 'url(' + BOOK_IMAGE + ')',
    };

    return (
      <div style={imageViaStyle} className="create-course-view full container-fluid">
        <div className="row">
          <div className="col-md-12">
            <h1>Create a new course content package</h1>

          </div>
        </div>
        <div className="row">
          <fieldset>
            <input type="text" ref="title" className="col-md-12" id="input"
                   placeholder="Math Primer, Engineering Statics, Spanish"/>
            <label htmlFor="input">Course Name</label>
          </fieldset>
        </div>
        <div className="row">
          {this.state.waiting
            ? waiting
            : this.state.error
              ? error
              : inputs }
        </div>
      </div>
    );
  }
}

export default CreateCourseView;


