import * as React from 'react';

import * as persistence from '../data/persistence';
import * as viewActions from '../actions/view';
import { LegacyTypes } from '../data/types';
import * as models from '../data/models';
import * as contentTypes from '../data/contentTypes';
import * as courseActions from '../actions/course';
import { hasRole } from '../actions/utils/keycloak';
import { PLACEHOLDER_ITEM_ID } from '../data/content/org/common';
import { Maybe } from 'tsmonad';

import './CoursesView.scss';

interface CoursesView {
  onSelect: (id) => void;
  _deleteCourse: (id) => void;
  _createCourse: () => void;
}

type CourseDescription = {
  guid: string,
  id: string,
  version: string,
  title: string,
  description: string,
  buildStatus: string,
};

export interface CoursesViewProps {
  userId: string;
  dispatch: any;
}

export interface CoursesViewState {
  courses: Maybe<CourseDescription[]>;
}

class CoursesView extends React.PureComponent<CoursesViewProps, CoursesViewState> {

  constructor(props) {
    super(props);

    this.state = { courses: Maybe.nothing<CourseDescription[]>() };
    this._createCourse = this.createCourse.bind(this);
    this.onSelect = (id) => {
      this.fetchDocument(id);
    };

  }

  createCourse() {
    viewActions.viewCreateCourse();
  }

  importExisting() {
    viewActions.viewImportCourse();
  }

  createPlaceholderPage(courseId: string) {

    const resource = models.WorkbookPageModel.createNew(
          PLACEHOLDER_ITEM_ID, 'Placeholder', 'This is a new page with empty content');

    persistence.createDocument(courseId, resource);

    return resource;
  }

  componentDidMount() {
    persistence.getEditablePackages()
      .then((docs) => {
        const courses: CourseDescription[] = docs.map(d => ({
          guid: d.guid,
          id: d.id,
          version: d.version,
          title: d.title,
          description: d.description,
          buildStatus: d.buildStatus,
        }));
        this.setState({ courses: Maybe.just(courses) });
      })
      .catch((err) => {
        console.log(err);
      });

  }

  fetchDocument(courseId: string) {

    persistence.retrieveCoursePackage(courseId)
      .then((document) => {
        // Notify that the course has changed when a user views a course
        if (document.model.modelType === models.ModelTypes.CourseModel) {

          const courseModel : models.CourseModel = document.model;

          if (!document.model.resources.toArray().some(
            resource => resource.id === PLACEHOLDER_ITEM_ID)) {

            const placeholder = this.createPlaceholderPage(courseId);
            const updatedModel = courseModel.with(
              { resources: courseModel.resources.set(PLACEHOLDER_ITEM_ID, placeholder.resource) });

            this.props.dispatch(courseActions.courseChanged(updatedModel));
            viewActions.viewDocument(courseId, courseId);

          } else {
            this.props.dispatch(courseActions.courseChanged(document.model));
            viewActions.viewDocument(courseId, courseId);
          }



        }

      })
      .catch(err => console.log(err));
  }

  renderBanner() {
    return (
      <div className="createCourse">

        <p className="lead">
          Welcome to the OLI course authoring platform.
        </p>
      </div>
    );
  }

  renderActionBar() {
    return (
      <div style={ { display: 'inline', float: 'right' } }>
        <button
          type="button" className="btn btn-primary" key="createNew"
          onClick={this.createCourse.bind(this)}>
          <b>Create new</b>
        </button>
        &nbsp;&nbsp;
        <button
          type="button" className="btn btn-primary" key="import"
          onClick={this.importExisting.bind(this)}>
          <b>Import existing</b>
        </button>
      </div>
    );
  }

  renderCourses(courses: CourseDescription[]) {
    return courses
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((c, i) => {

        const { guid, id, version, title, description, buildStatus } = c;

        const isReady = buildStatus === 'READY';

        const button =
          <button
            disabled={!isReady}
            type="button" className="btn btn-link" key={guid}
            onClick={this.onSelect.bind(this, guid)}>
            {title +  ' - v' + version + (isReady ? '' : ' (Import in process)')}
          </button>;

        return (
          <div key={guid}>
            <div className="content ">
              <div className="row">
                <div className="col-5">
                  {button}
                </div>
              </div>
            </div>
          </div>
        );
      });
  }

  renderNoCourses() {
    return (
      <div>
      <p className="lead">
        <b>You have no course packages available.</b>
      </p>

      Try:

      <ul>
        <li>Creating a new course package</li>
        <li>Importing an existing OLI course package directly from a Subversion repository</li>
        <li>Contacting another user to have them grant you access to their course package</li>
      </ul>

      </div>
    );
  }

  renderWaiting() {
    return (
      <p className="lead">
        Loading...
      </p>
    );
  }

  render() {
    return (
      <div>
        {this.renderBanner()}

        <div className="myCoursePackages">

          <h2 style={ { display: 'inline' } }>My Course Packages</h2>

          {this.renderActionBar()}

          <div style={ { marginTop: '30px' }}>

          {this.state.courses.caseOf({
            just: courses => courses.length === 0
              ? this.renderNoCourses() : this.renderCourses(courses),
            nothing: () => this.renderWaiting(),
          })}

          </div>

        </div>
      </div>
    );
  }
}

export default CoursesView;


