import * as React from 'react';
import * as Immutable from 'immutable';
import * as persistence from 'data/persistence';
import * as models from 'data/models';
import { Typeahead } from 'react-bootstrap-typeahead';
import { hasRole } from 'actions/utils/keycloak';
import { UserInfo } from 'data//contentTypes';
import { Button } from 'editors/content/common/Button';
import { Select } from 'editors/content/common/Select';
import { Document } from 'data/persistence/common';
import './CourseEditor.scss';
import ModalPrompt from 'utils/selection/ModalPrompt';
import { DeploymentStatus } from 'data/models/course';
import { LegacyTypes, CourseId } from 'data/types';
import { ResourceState, Resource } from 'data/content/resource';
import { LoadingSpinner } from 'components/common/LoadingSpinner';
import { isNullOrUndefined } from 'util';
import { Title } from 'components/objectives/Title';
import { ProductionRedeploy } from 'data/persistence/package';

const THUMBNAIL = require('../../../../assets/ph-courseView.png');

export interface CourseEditorProps {
  model: models.CourseModel;
  courseChanged: (m: models.CourseModel) => any;
  viewAllCourses: () => any;
  editMode: boolean;
  onDisplayModal: (component: any) => void;
  onDismissModal: () => void;
  onPreview: (courseId: CourseId, organizationId: string, redeploy: boolean) => Promise<any>;
}

type ThemeSelection = {
  id: string,
  selected: boolean,
};

interface CourseEditorState {
  selectedDevelopers: UserInfo[];
  themes: ThemeSelection[];
  selectedOrganizationId: string;

  // Publish (full preview)
  isPublishing: boolean;
  failedPublish: boolean;

  // Request QA in content-service
  isRequestingQA: boolean;
  finishedQARequest: boolean;
  failedQARequest: boolean;

  // Request Production in content-service
  isRequestingProduction: boolean;
  finishedProductionRequest: boolean;
  failedProductionRequest: boolean;

  // Request Update in content-service for live course
  isRequestingUpdate: boolean;
  finishedUpdateRequest: boolean;
  failedUpdateRequest: boolean;

  // Request Redeploy in content-service for live course
  isRequestingRedeploy: boolean;
  finishedRedeployRequest: boolean;
  failedRedeployRequest: boolean;
}

class CourseEditor extends React.Component<CourseEditorProps, CourseEditorState> {

  organizations: Resource[] = [];

  constructor(props: CourseEditorProps) {
    super(props);

    this.state = {
      selectedDevelopers: props.model.developers.filter(d => d.isDeveloper).toArray(),
      themes: [],
      selectedOrganizationId: '',
      isPublishing: false,
      failedPublish: false,
      isRequestingQA: false,
      finishedQARequest: false,
      failedQARequest: false,
      isRequestingProduction: false,
      finishedProductionRequest: false,
      failedProductionRequest: false,
      isRequestingUpdate: false,
      finishedUpdateRequest: false,
      failedUpdateRequest: false,
      isRequestingRedeploy: false,
      finishedRedeployRequest: false,
      failedRedeployRequest: false,
    };

    this.onEditDevelopers = this.onEditDevelopers.bind(this);
    this.renderMenuItemChildren = this.renderMenuItemChildren.bind(this);
    this.onEditTheme = this.onEditTheme.bind(this);
    this.displayRemovePackageModal = this.displayRemovePackageModal.bind(this);
    this.onDescriptionEdit = this.onDescriptionEdit.bind(this);
    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onPublish = this.onPublish.bind(this);
    this.onRequestQA = this.onRequestQA.bind(this);
    this.onRequestProduction = this.onRequestProduction.bind(this);
    this.onRequestUpdate = this.onRequestUpdate.bind(this);
    this.onRequestRedeploy = this.onRequestRedeploy.bind(this);
  }

  componentDidMount() {
    this.fetchGlobalThemes();
    this.organizations = this.props.model.resources
      .filter((resource: Resource) =>
        resource.type === LegacyTypes.organization &&
        resource.resourceState !== ResourceState.DELETED)
      .toArray();
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

  // Used as a string in renderStatus, and as a boolean in renderActions
  statusIsActive = (status: DeploymentStatus) => {
    const { model } = this.props;
    return model.deploymentStatus === status
      ? 'active '
      : '';
  }

  renderStatus() {

    return (
      <div className="vertical steps">
        <div className={this.statusIsActive(DeploymentStatus.DEVELOPMENT) + 'step'}>
          {/* <i className="icon">1</i> */}
          <div className="content">
            <div className="title">Development</div>
            <div className="description">This course package is still under active development
            and has not been deployed.</div>
          </div>
        </div>
        <div className={this.statusIsActive(DeploymentStatus.QA) + 'step'}>
          <div className="content">
            <div className="title">QA</div>
            <div className="description">This course package is ready to be reviewed before being
            deployed publically to students.</div>
          </div>
        </div>
        <div className={this.statusIsActive(DeploymentStatus.REQUESTING_PRODUCTION) + 'step'}>
          <div className="content">
            <div className="title">Production Requested</div>
            <div className="description">This course package has been requested to be deployed
            to production.</div>
          </div>
        </div>
        <div className={this.statusIsActive(DeploymentStatus.PRODUCTION) + 'step'}>
          <div className="content">
            <div className="title">Production</div>
            <div className="description">This course package is live and available to
                        students. Changes are limited.</div>
          </div>
        </div>
      </div>
    );
  }

  renderActions() {
    const { model } = this.props;

    const { isPublishing, isRequestingQA, finishedQARequest,
      failedQARequest, isRequestingProduction, finishedProductionRequest,
      failedProductionRequest, isRequestingUpdate, finishedUpdateRequest, failedUpdateRequest,
      isRequestingRedeploy, finishedRedeployRequest, failedRedeployRequest } = this.state;

    const isPublishingButton = <button
      disabled
      className="btn btn-block btn-primary publishButton"
      onClick={() => { }}>
      <LoadingSpinner className="u-no-padding text-white" message="Publishing" />
    </button>;

    const publishButton = <button
      className="btn btn-block btn-primary publishButton"
      onClick={() => this.onPublish()}>
      Publish
    </button>;

    const redeployButton = <button
      className="btn btn-block btn-danger redeployButton"
      onClick={() => this.onRequestRedeploy()}>
      Redeploy
    </button>;

    const updateButton = <button
      className="btn btn-block btn-primary updateButton"
      onClick={() => this.onRequestUpdate()}>
      Update
    </button>;

    const requestQAButton = (firstDeployment: boolean) => <div key="requestQAButton">
      <p>
        {firstDeployment
          ? 'If your course package is ready to go to QA, you can request for OLI to deploy \
          the course to the QA server for public review.'
          : 'If you\'ve made changes to your course package since your last deployment to QA, \
          you can request for OLI to redeploy the course to the QA server for further review.'
        }

      </p>
      <button
        className="btn btn-block btn-secondary requestQAButton"
        onClick={this.onRequestQA}>
        Request QA
      </button>&nbsp;
        {isRequestingQA ? <i className="fa fa-circle-o-notch fa-spin fa-1x fa-fw" /> : ''}
      {finishedQARequest ? <i className="fa fa-check-circle" /> : ''}
      {failedQARequest ? <i className="fa fa-times-circle" /> : ''}
      <br /><br />
    </div>;

    const option = (org: Resource) =>
      <option
        key={org.guid}
        value={org.guid}>
        {org.title}
      </option>;

    const options = this.organizations.map(option);

    const content = [];

    if (!model.deploymentStatus ||
      this.statusIsActive(DeploymentStatus.DEVELOPMENT) ||
      this.statusIsActive(DeploymentStatus.QA)) {
      content.push(
        <div key="publishSelect">
          <div><p>Select an organization to publish:</p>
            <Select
              {...this.props}
              className="publishSelect"
              // Use the selected organization if present, or the first in the list as a default
              value={this.state.selectedOrganizationId}
              onChange={orgId => this.setState({ selectedOrganizationId: orgId })}>
              {options}
            </Select>
          </div>
          <br />
          <p>
            You can <strong>publish</strong> the complete course package
            using this organization to allow it to be previewed publically.
            This action may take awhile.
          </p>
          {isPublishing
            ? isPublishingButton
            : publishButton}
          <br />
        </div>,
      );
    }
    if (this.statusIsActive(DeploymentStatus.QA) ||
      this.statusIsActive(DeploymentStatus.REQUESTING_PRODUCTION) ||
      this.statusIsActive(DeploymentStatus.PRODUCTION)) {
      // Enable when Raphael makes the necessary changes to the legacy system to support a course
      // preview without deployment
      // content.push(
      //   <a key="previewButton"
      //     onClick={() => this.onPublish(false)}
      //     className="btn btn-link"
      //     target="_blank">
      //     Preview the selected organization
      //   </a>,
      // );
    }
    if (!model.deploymentStatus ||
      this.statusIsActive(DeploymentStatus.DEVELOPMENT)) {
      content.push(requestQAButton(true));
    }
    if (this.statusIsActive(DeploymentStatus.QA) ||
      this.statusIsActive(DeploymentStatus.PRODUCTION)) {
      content.push(requestQAButton(false));
    }
    if (this.statusIsActive(DeploymentStatus.QA)) {
      content.push(
        <div key="requestProdButton">
          <p>
            If your course package is ready to go to production, you can request for OLI to deploy
            the course to the production server for public use.
          </p>
          <button
            className="btn btn-block btn-secondary requestProductionButton"
            onClick={this.onRequestProduction}>
            Request Production
          </button>&nbsp;
          {isRequestingProduction ? <i className="fa fa-circle-o-notch fa-spin fa-1x fa-fw" /> : ''}
          {finishedProductionRequest ? <i className="fa fa-check-circle" /> : ''}
          {failedProductionRequest ? <i className="fa fa-times-circle" /> : ''}
        </div>,
      );
    }
    if (this.statusIsActive(DeploymentStatus.PRODUCTION)) {
      content.push(
        <div key="updateProdButton">
          <br />
          <p>
            This course package is available on the production server,
            but you can notify the OLI team to make non-structural updates to course content.
          </p>
          {updateButton}&nbsp;
          {isRequestingUpdate ? <i className="fa fa-circle-o-notch fa-spin fa-1x fa-fw" /> : ''}
          {finishedUpdateRequest ? <i className="fa fa-check-circle" /> : ''}
          {failedUpdateRequest ? <i className="fa fa-times-circle" /> : ''}
          <br /><br />
          <p>
            Alternatively, you can make more substantial updates by redeploying the course package.
            This will reset all students' data.
          </p>
          {redeployButton}&nbsp;
          {isRequestingRedeploy ? <i className="fa fa-circle-o-notch fa-spin fa-1x fa-fw" /> : ''}
          {finishedRedeployRequest ? <i className="fa fa-check-circle" /> : ''}
          {failedRedeployRequest ? <i className="fa fa-times-circle" /> : ''}
        </div>,
      );
    }

    if (content.length === 0) {
      content.push(
        <div>No actions available in this deployment state.</div>,
      );
    }

    return content;
  }

  onPublish(redeploy: boolean = true) {
    const { model, onPreview, courseChanged } = this.props;

    this.setState({
      isPublishing: true,
    });

    onPreview(
      model.guid,
      this.state.selectedOrganizationId || (this.organizations[0] && this.organizations[0].guid),
      redeploy)
      .then((_) => {
        this.setState({ isPublishing: false });
      })
      .catch((err) => {
        this.setState({ isPublishing: false, failedPublish: true });
        console.error('Preview publish error:', err);
      });
  }

  onRequestQA() {
    const { model, courseChanged } = this.props;

    this.setState(
      {
        finishedQARequest: false,
        isRequestingQA: true,
      },
      () =>
        persistence.transitionDeploymentStatus(model.guid, DeploymentStatus.QA)
          .then(_ => this.setState(
            {
              isRequestingQA: false,
              finishedQARequest: true,
            },
            () => courseChanged(model.with({
              deploymentStatus: DeploymentStatus.QA,
            })),
          ))
          .catch(_ => this.setState({
            isRequestingQA: false,
            failedQARequest: true,
          })));
  }

  onRequestProduction() {
    const { model, courseChanged } = this.props;

    this.setState(
      {
        finishedProductionRequest: false,
        isRequestingProduction: true,
      },
      () =>
        persistence.transitionDeploymentStatus(model.guid, DeploymentStatus.REQUESTING_PRODUCTION)
          .then(_ => this.setState(
            {
              isRequestingProduction: false,
              finishedProductionRequest: true,
            },
            () => courseChanged(model.with({
              deploymentStatus: DeploymentStatus.REQUESTING_PRODUCTION,
            })),
          ))
          .catch(_ => this.setState({
            isRequestingProduction: false,
            failedProductionRequest: true,
          })));
  }

  onRequestRedeploy() {
    const { model } = this.props;

    this.props.onDisplayModal(<ModalPrompt
      text={'Are you sure you want to redeploy this course? \
        All student data and progress will be reset.'}
      onInsert={() => {
        this.setState({ finishedRedeployRequest: false, isRequestingRedeploy: true }, () => {
          persistence.transitionDeploymentStatus(
            model.guid, DeploymentStatus.PRODUCTION, ProductionRedeploy.Redeploy)
            .then(_ => this.setState({
              isRequestingRedeploy: false,
              finishedRedeployRequest: true,
            }))
            .catch(_ => this.setState({
              isRequestingRedeploy: false,
              failedRedeployRequest: true,
            }));
          this.props.onDismissModal();
        });
      }}
      onCancel={() => this.props.onDismissModal()}
      okLabel="Yes"
      okClassName="danger"
      cancelLabel="No"
    />);
  }

  onRequestUpdate() {
    const { model } = this.props;
    this.setState({ finishedUpdateRequest: false, isRequestingUpdate: true }, () => {
      persistence.transitionDeploymentStatus(
        model.guid, DeploymentStatus.PRODUCTION, ProductionRedeploy.Update)
        .then(_ => this.setState({
          isRequestingUpdate: false,
          finishedUpdateRequest: true,
        }))
        .catch(_ => this.setState({
          isRequestingUpdate: false,
          failedUpdateRequest: true,
        }));
    });
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
      onInsert={() => { this.removePackage(); this.props.onDismissModal(); }}
      onCancel={() => this.props.onDismissModal()}
      okLabel="Yes"
      okClassName="danger"
      cancelLabel="No"
    />);
  }

  onDescriptionEdit(description) {
    const model = this.props.model.with({ description });
    this.props.courseChanged(model);
    const doc = new Document().with({
      _courseId: model.guid,
      _id: model.id,
      _rev: model.rev.toString(),
      model,
    });
    persistence.persistDocument(doc);
  }

  onTitleEdit(title) {
    const model = this.props.model.with({ title });
    this.props.courseChanged(model);
    const doc = new Document().with({
      _courseId: model.guid,
      _id: model.id,
      _rev: model.rev.toString(),
      model,
    });
    persistence.persistDocument(doc);
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
      <div className="course-editor" >
        <div className="row info">
          <div className="col-md-9">
            <h2>Course Package</h2>
            <div className="infoContain">
              <div className="row">
                <div className="col-3">Title</div>
                <div className="col-9">
                  <Title title={model.title}
                    editMode={this.props.editMode}
                    onBeginExternallEdit={() => true}
                    requiresExternalEdit={false}
                    isHoveredOver={true}
                    onEdit={this.onTitleEdit}
                    loading={false}
                    disableRemoval={true}
                    editWording="Edit"
                    onRemove={() => false}
                  >{model.title}</Title>
                </div>
              </div>
              <div className="row">
                <div className="col-3">Description</div>
                <div className="col-9">
                  <Title title={model.description}
                    editMode={this.props.editMode}
                    onBeginExternallEdit={() => true}
                    requiresExternalEdit={false}
                    isHoveredOver={true}
                    onEdit={this.onDescriptionEdit}
                    loading={false}
                    disableRemoval={true}
                    editWording="Edit"
                    onRemove={() => false}
                  >{model.description}</Title>
                </div>
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
              <div className="row">
                <div className="col-3">Status</div>
                <div className="col-9">
                  {this.renderStatus()}
                </div>
              </div>
              <div className="row">
                <div className="col-3">Actions</div>
                <div className="col-9">
                  {this.renderActions()}
                </div>
              </div>
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
