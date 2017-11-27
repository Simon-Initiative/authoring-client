import * as React from 'react';
import * as persistence from 'data/persistence';
import * as models from 'data/models';
import { hasRole } from 'actions/utils/keycloak';
import * as viewActions from 'actions/view';
import {
  AbstractEditor,
  AbstractEditorProps,
  AbstractEditorState,
} from '../common/AbstractEditor';

import './CourseEditor.scss';

export interface CourseEditorProps extends AbstractEditorProps<models.CourseModel> {

}


interface CourseEditorState extends AbstractEditorState {
  failure: boolean;
}

class CourseEditor
  extends AbstractEditor<models.CourseModel, CourseEditorProps, CourseEditorState> {
  constructor(props) {
    super(props, { failure: false });
  }

  registration(developers: string, action: string) {
    const courseId = this.props.model.guid;
    persistence.developerRegistration(courseId, [developers], action)
      .then((result) => {
        let devs = this.props.model.developers;
        result.forEach((item) => {
          const userName = item.userName;
          devs = devs.set(userName, item);
        });
        this.setState(
          { failure: false },
          () => this.props.onEdit(this.props.model.with({ developers: devs })));

      })
      .catch((err) => {
        this.setState(
          { failure: true });
      });
  }

  renderResources() {
    const developers = this.props.model.developers.toArray().map(d =>
      <div key={d.userName} className="row user">
        <div className="col-10">
          <span className="profile"></span>
          <span className="name">{d.firstName} {d.lastName}</span>
          <span className="inst">Carnegie Mellon University</span>
          <span className="email">{d.email}</span>
        </div>
        <div className="col-2">
          <button type="button" className={d.isDeveloper ? 'btn btn-remove' : 'btn btn-primary'}
                  onClick={e =>
                  this.registration(
                    d.userName, d.isDeveloper ? 'remove' : 'add')}>
            {d.isDeveloper ? 'Remove' : 'Add'}
          </button>
        </div>
      </div>,
    );
    return (
      <div className="row users">
        <div className="col-md-9">
          <h2>Team Members</h2>
          <div className="userContain">
            {developers}
          </div>
        </div>
      </div>
    );
  }

  removePackage() {
    persistence.deleteCoursePackage(this.props.model.guid)
    .then((document) => {
      this.props.dispatch(viewActions.viewAllCourses());
    })
    .catch(err => console.log(err));
  }

  render() {
    const model = this.props.model;

    const isAdmin = hasRole('admin');

    const adminRow = isAdmin
      ? <div className="row">
          <div className="col-3">Administer</div>
          <div className="col-9">
          <button type="button"
            className="btn btn-danger"
            onClick={this.removePackage.bind(this)}>
            Remove Package
            </button>
          </div>
        </div>
      : null;

    return (
      <div className="course-editor">
        <div className="row info">
          <div className="col-md-9">
            <h2>Content Package</h2>
            <div className="infoContain">
              <div className="row">
                <div className="col-3">Title</div>
                <div className="col-9">{model.title}</div>
              </div>
              <div className="row">
                <div className="col-3">Description</div>
                <div className="col-9">{model.description}</div>
              </div>
              <div className="row">
                <div className="col-3">Id</div>
                <div className="col-9">{model.id}</div>
              </div>
              <div className="row">
                <div className="col-3">Version</div>
                <div className="col-9">{model.version}</div>
              </div>
              <div className="row">
                <div className="col-3">Type</div>
                <div className="col-9">{model.type}</div>
              </div>
              <div className="row">
                <div className="col-3">Thumbnail<br/><br/>

                </div>
                <div className="col-9">
                  <img src="assets/ph-courseView.png" className="img-fluid" alt=""></img>

                </div>
              </div>
              {adminRow}
            </div>
          </div>
        </div>

        <br/><br/>

        {this.renderResources()}
      </div>
    );
  }

}

export default CourseEditor;
