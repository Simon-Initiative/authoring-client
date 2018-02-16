import * as React from 'react';
import * as Immutable from 'immutable';
import * as persistence from 'data/persistence';
import * as models from 'data/models';
import { Typeahead } from 'react-bootstrap-typeahead';
import { hasRole } from 'actions/utils/keycloak';
import { UserInfo } from 'data//contentTypes';
import * as viewActions from 'actions/view';
import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';
import { Position, HelpPopover } from 'editors/common/popover/HelpPopover';

import './CourseEditor.scss';

const THUMBNAIL = require('../../../../assets/ph-courseView.png');

export interface CourseEditorProps extends AbstractEditorProps<models.CourseModel> {
  courseChanged: (model: models.CourseModel) => void;
}


interface CourseEditorState extends AbstractEditorState {
  selectedDevelopers: UserInfo[];
}

class CourseEditor
  extends AbstractEditor<models.CourseModel, CourseEditorProps, CourseEditorState> {
  constructor(props: CourseEditorProps) {
    super(
      props,
      {
        selectedDevelopers: props.model.developers.filter(d => d.isDeveloper).toArray(),
      });

    this.onEditDevelopers = this.onEditDevelopers.bind(this);
    this.renderMenuItemChildren = this.renderMenuItemChildren.bind(this);
  }

  componentWillReceiveProps(nextProps: CourseEditorProps) {
    this.setState({
      selectedDevelopers: nextProps.model.developers.filter(d => d.isDeveloper).toArray(),
    });
  }

  onEditDevelopers(developers: UserInfo[]) {

    // For some reason the onChange callback for the Typeahead executes
    // twice for each UI-driven edit.  This check short-circuits the
    // second call.
    if (developers.length === this.state.selectedDevelopers.length) {
      return;
    }

    const courseId = this.props.context.courseId;

    const action = developers.length > this.state.selectedDevelopers.length
      ? 'add' : 'remove';

    const current = Immutable.Map<string, UserInfo>
      (this.state.selectedDevelopers.map(d => [d.userName, d]));
    const updated = Immutable.Map<string, UserInfo>
      (developers.map(d => [d.userName, d]));

    const changes = (developers.length > this.state.selectedDevelopers.length
      ? updated.filter(d => !current.has(d.userName))
      : current.filter(d => !updated.has(d.userName)))
      .map(d => d.userName)
      .toArray();

    // Update the UI and persist the changes to the backend
    this.setState(
      { selectedDevelopers: developers },
      () => {
        persistence.developerRegistration(courseId, changes, action)
          .catch((err) => {
            // We need to handle this better.  This editor should be managed
            // by the EditorManager
            console.log(err);
          });
      });

    // Update the course model to reflect these changes - do this by
    // toggling the isDeveloper status of each changed developer
    const changedSet = Immutable.Set<string>(changes);
    const updatedDevelopers = this.props.model.developers.map((d) => {
      if (changedSet.has(d.userName)) {
        return d.with({ isDeveloper: !d.isDeveloper });
      }
      return d;
    }).toOrderedMap();
    const model = this.props.model.with({ developers: updatedDevelopers });
    this.props.courseChanged(model);
  }

  renderMenuItemChildren(dev: UserInfo, props, index) {
    const name = dev.firstName + ' ' + dev.lastName;
    return [
      <strong key="name">{name}</strong>,
      <div key="email">
        <small>{dev.email}</small>
      </div>,
    ];
  }


  renderDevelopers() {

    const developers = this.props.model.developers.toArray();

    return (
      <Typeahead
        disabled={!this.props.editMode}
        multiple
        renderMenuItemChildren={this.renderMenuItemChildren}
        onChange={this.onEditDevelopers}
        options={developers}
        labelKey={d => `${d.firstName} ${d.lastName}`}
        selected={this.state.selectedDevelopers}
      />
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
            <h2>Course Package</h2>
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
                <div className="col-3">
                  Team members
                  <span className="float-right">
                    <HelpPopover
                      position={('top' as Position)}>
                      <div>
                        <p>Looks like you could use some help.</p>
                        <p>You can click <a href="#" target="_blank">here</a>&nbsp;
                        to get some more information.</p>
                      </div>
                    </HelpPopover>
                  </span>
                </div>
                <div className="col-9">
                  {this.renderDevelopers()}
                </div>
              </div>
              <div className="row">
                <div className="col-3">Version</div>
                <div className="col-9">{model.version}</div>
              </div>
              <div className="row">
                <div className="col-3">Thumbnail<br/><br/>
                </div>
                <div className="col-9">
                  <img src={THUMBNAIL} className="img-fluid" alt=""></img>
                </div>
              </div>
              {adminRow}
            </div>
          </div>
        </div>
      </div>
    );
  }

}

export default CourseEditor;
