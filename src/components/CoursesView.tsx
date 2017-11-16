import * as React from 'react';

import * as persistence from '../data/persistence';
import * as viewActions from '../actions/view';
import { LegacyTypes } from '../data/types';
import * as models from '../data/models';
import * as contentTypes from '../data/contentTypes';
import * as courseActions from '../actions/course';
import { hasRole } from '../actions/utils/keycloak';
import { PLACEHOLDER_ITEM_ID } from '../data/content/org/common';

import './CoursesView.scss';

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

class CoursesView extends React.PureComponent<CoursesViewProps, { courses: CourseDescription[] }> {
  onSelect: (id) => void;
  deleteCourse: (id) => void;

  constructor(props) {
    super(props);

    this.state = { courses: [] };
    this.createCourse = this.createCourse.bind(this);
    this.onSelect = (id) => {
      this.fetchDocument(id);
    };
    this.deleteCourse = (id) => {
      this.removeCourse(id);
    };
  }

  createCourse() {
    viewActions.viewCreateCourse();
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
        this.setState({ courses });
      })
      .catch((err) => {
        console.log(err);
      });

  }

  removeCourse(courseId: string) {
    persistence.deleteCoursePackage(courseId)
      .then((document) => {
        this.props.dispatch(viewActions.viewAllCourses());
      })
      .catch(err => console.log(err));
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

  render() {
    const rows = this.state.courses.map((c, i) => {
      const { guid, id, version, title, description, buildStatus } = c;
      return <div className="course" key={guid}>
        <img src="assets/ph-courseView.png" className="img-fluid" alt=""/>
        <div className="content container">
          <div className="row">

            {/*
             <div className="information col-3">
             <span className="title">{id + '_' + version}</span>
             </div>
             */}
            <div className="information col-3">

                <div className="row">
                  {title}
                  {/*<span className="title">{title}</span>*/}
                </div>
                <div className="row">
                  Id: {id}
                  {/*<span className="name">Id: {id}</span>*/}
                </div>
                <div className="row">
                  Version: {version}
                  {/*<span className="name">Version: {version}</span>*/}
                </div>
            </div>
            <div className="description col-7">
              {description}
            </div>
            <div className="enter col-2">
              { buildStatus === 'READY' ?
                <div>
                  <div className="row">

                    <button type="button" className="btn btn-primary" key={guid}
                            onClick={this.onSelect.bind(this, guid)}>
                      Enter Course
                    </button>
                  </div>
                  {hasRole('admin') &&
                  <div className="row">
                    <button type="button" className="btn btn-remove" key={guid}
                            onClick={this.deleteCourse.bind(this, guid)}>
                      Remove
                    </button>
                  </div>}
                </div>
                : <div>
                  <div>Package Importing...</div>
                  <div style={{ margin: 'auto' }} className="three-bounce">
                    <div className="bounce1"/>
                    <div className="bounce2"/>
                    <div className="bounce3"/>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>;
    });

    return (
      <div className="courses-view">
        <div className="create-course">
          <div className="container">
            <div className="row">
              <div className="col-6 offset-1">
                <p className="lead">
                  OLI’s aim is to combine free, high-quality courses, continuous feedback, and
                  research to improve learning and transform higher education. If you’re
                  ready to check out OLI for yourself, let’s get started.
                </p>
              </div>
              <div className="col-4">
                <button onClick={this.createCourse}
                        className="btn btn-secondary btn-lg btn-block outline serif">
                  <img src="assets/icon-book.png" width="42" height="42"
                       className="d-inline-block align-middle" alt=""/>
                  Create Course Package
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="container course-view editor">
          <h2>Course Packages</h2>
          {rows}
        </div>
      </div>
    );
  }
}

export default CoursesView;


