import * as React from 'react';
import * as Immutable from 'immutable';
import * as persistence from 'data/persistence';
import * as models from 'data/models';
import { Typeahead } from 'react-bootstrap-typeahead';
import { hasRole } from 'actions/utils/keycloak';
import { UserInfo } from 'data//contentTypes';
import { Button } from 'editors/content/common/Button';
import { Select } from 'editors/content/common/Select';

import './CourseEditor.scss';
import ModalPrompt from 'utils/selection/ModalPrompt';

// const THUMBNAIL = require('../../../../assets/ph-courseView.png');

export interface CourseEditorProps {
  model: models.CourseModel;
  courseChanged: (m: models.CourseModel) => any;
  viewAllCourses: () => any;
  editMode: boolean;
  onDisplayModal: (component: any) => void;
  onDismissModal: () => void;
}

type ThemeSelection = {
  id: string,
  selected: boolean,
};

interface CourseEditorState {
  selectedDevelopers: UserInfo[];
  themes: ThemeSelection[];
}

class CourseEditor extends React.Component<CourseEditorProps, CourseEditorState> {
  constructor(props: CourseEditorProps) {
    super(props);

    this.state = {
      selectedDevelopers: props.model.developers.filter(d => d.isDeveloper).toArray(),
      themes: [],
    };

    this.onEditDevelopers = this.onEditDevelopers.bind(this);
    this.renderMenuItemChildren = this.renderMenuItemChildren.bind(this);
    this.onEditTheme = this.onEditTheme.bind(this);
    this.displayRemovePackageModal = this.displayRemovePackageModal.bind(this);
  }

  componentDidMount() {
    this.fetchGlobalThemes();
  }

  // Fetch all globally available themes, sort alphabetically, and choose one to be selected
  fetchGlobalThemes() {
    const { model } = this.props;

    persistence.fetchCourseThemes(model.guid)
      .then(themes => this.setState({
        themes: themes
          .sort((a, b) => a.id.localeCompare(b.id))
          // The course may have a default theme set under the 'theme' property of the model.
          // If not, use the global default theme as the selected option
          .map(theme => ({
            id: theme.id,
            selected: model.theme
              ? theme.id === model.theme
              : theme.default,
          })),
      }));
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

    const courseId = this.props.model.guid;

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

  renderThemes() {
    const { themes } = this.state;

    const option = (theme: ThemeSelection) =>
      <option
        key={theme.id}
        value={theme.id}>
        {theme.id}
      </option>;

    const options = themes.map(option);
    const selectedTheme = themes.find(theme => theme.selected);

    return (
      <Select
        {...this.props}
        className="themeSelect"
        value={selectedTheme && selectedTheme.id}
        onChange={this.onEditTheme}>
        {options}
      </Select>
    );
  }

  onEditTheme(themeId: string) {
    const { model, courseChanged } = this.props;

    persistence.setCourseTheme(model.guid, themeId)
      // Update the dropdown and course model with the newly selected theme
      .then((_) => {
        this.setState({
          themes: this.state.themes.map(
            theme => theme.id === themeId
              ? Object.assign(theme, { selected: true })
              : Object.assign(theme, { selected: false })),
        });
        courseChanged(model.with({ theme: themeId }));
      })
      .catch(err => console.log(`Error setting theme ${themeId}: ${err}`));

  }

  removePackage() {
    persistence.deleteCoursePackage(this.props.model.guid)
      .then((document) => {
        this.props.viewAllCourses();
      })
      .catch(err => console.log(err));
  }

  displayRemovePackageModal() {
    this.props.onDisplayModal(<ModalPrompt
      text={'Are you sure you want to permanently delete this course package? \
          This action cannot be undone.'}
      onInsert={() => { this.removePackage; this.props.onDismissModal(); }}
      onCancel={() => this.props.onDismissModal()}
      okLabel="Yes"
      okClassName="danger"
      cancelLabel="No"
    />);
  }

  render() {
    const { model } = this.props;

    const isAdmin = hasRole('admin');

    const adminRow = isAdmin
      ? <div className="row">
        <div className="col-3">Administrator</div>
        <div className="col-3">
          <Button
            editMode
            type="outline-primary"
            onClick={() => persistence.skillsDownload(this.props.model.guid)}>
            <i className="fa fa-download" />&nbsp;Download Skill Files
          </Button>
        </div>
        <div className="col-3">
          <Button
            editMode
            type="outline-danger"
            onClick={this.displayRemovePackageModal}>
            Delete Course Package
          </Button>
        </div>
        <div className="col-3"></div>
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
                <div className="col-3">Unique ID</div>
                <div className="col-9">{model.id}</div>
              </div>
              <div className="row">
                <div className="col-3">Team members</div>
                <div className="col-9">{this.renderDevelopers()}</div>
              </div>
              <div className="row">
                <div className="col-3">Theme</div>
                <div className="col-9">{this.renderThemes()}</div>
              </div>
              <div className="row">
                <div className="col-3">Version</div>
                <div className="col-9">{model.version}</div>
              </div>
              {/* Disabling Thumbnail until it has a real purpose */}
              {/* <div className="row">
                <div className="col-3">Thumbnail<br /><br />
                </div>
                <div className="col-9">
                  <img src={THUMBNAIL} className="img-fluid" alt=""></img>
                </div>
              </div> */}
              {adminRow}
            </div>
          </div>
        </div>
      </div>
    );
  }

}

export default CourseEditor;
