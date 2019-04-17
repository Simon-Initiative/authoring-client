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
import { DeploymentStatus, DeployStage } from 'data/models/course';
import { LegacyTypes, CourseId } from 'data/types';
import { ResourceState, Resource } from 'data/content/resource';
import { Title } from 'components/objectives/Title';
import { HelpPopover } from 'editors/common/popover/HelpPopover.controller';
import { TextInput } from 'editors/content/common/controls';
import { isNullOrUndefined } from 'util';
import { PackageLicenseTypes } from 'data/content/learning/common';
import { TabContainer, Tab } from 'components/common/TabContainer';
import { AnalyticsState } from 'reducers/analytics';
import { LoadingSpinner } from 'components/common/LoadingSpinner';

// const THUMBNAIL = require('../../../../assets/ph-courseView.png');
const CC_LICENSES = require('../../../../assets/cclicenses.png');

export interface CourseEditorProps {
  model: models.CourseModel;
  editMode: boolean;
  analytics: AnalyticsState;
  courseChanged: (m: models.CourseModel) => any;
  viewAllCourses: () => any;
  onDisplayModal: (component: any) => void;
  onDismissModal: () => void;
  onPreview: (courseId: CourseId, organizationId: string, redeploy: boolean) => Promise<any>;
  onCreateDataset: () => void;
}

type ThemeSelection = {
  id: string,
  selected: boolean,
};

interface CourseEditorState {
  selectedDevelopers: UserInfo[];
  themes: ThemeSelection[];
  selectedOrganizationId: string;
  newVersionNumber: string;
  isNewVersionValid: boolean;
}

interface RequestButtonProps { text: string; className: string; onClick: () => Promise<any>; }
interface RequestButtonState { pending: boolean; successful: boolean; failed: boolean; }
export class RequestButton extends React.Component<RequestButtonProps, RequestButtonState> {
  constructor(props: RequestButtonProps) {
    super(props);

    this.state = {
      pending: false,
      successful: false,
      failed: false,
    };

    this.onClickWithState = this.onClickWithState.bind(this);
  }

  onClickWithState(): () => void {
    const { onClick } = this.props;

    return () => this.setState(
      { pending: true, successful: false, failed: false },
      () => onClick()
        .then(_ => this.setState({ pending: false, successful: true, failed: false }))
        .catch(_ => this.setState({ pending: false, successful: false, failed: true })));
  }

  render() {
    const { text, className, children } = this.props;
    const { pending, successful, failed } = this.state;

    return (
      <span>
        <button
          style={{ marginRight: '5px' }}
          className={`btn ${className}`}
          onClick={this.onClickWithState()}>
          {text}
          {children}
        </button>
        {pending ? <i className="fas fa-circle-notch fa-spin fa-1x fa-fw" /> : null}
        {successful ? <i className="fas fa-check-circle" /> : null}
        {failed ? <i className="fas fa-times-circle" /> : null}
      </span>
    );
  }
}

class CourseEditor extends React.Component<CourseEditorProps, CourseEditorState> {

  organizations: Resource[] = [];

  constructor(props: CourseEditorProps) {
    super(props);

    this.state = {
      selectedDevelopers: props.model.developers.filter(d => d.isDeveloper).toArray(),
      themes: [],
      selectedOrganizationId: '',
      newVersionNumber: '',
      isNewVersionValid: false,
    };

    this.onEditDevelopers = this.onEditDevelopers.bind(this);
    this.renderMenuItemChildren = this.renderMenuItemChildren.bind(this);
    this.onEditTheme = this.onEditTheme.bind(this);
    this.displayRemovePackageModal = this.displayRemovePackageModal.bind(this);
    this.onDescriptionEdit = this.onDescriptionEdit.bind(this);
    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onRequestDeployment = this.onRequestDeployment.bind(this);
    this.onClickNewVersion = this.onClickNewVersion.bind(this);
    this.validateVersionNumber = this.validateVersionNumber.bind(this);
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
            console.error(err);
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
      .catch(err => console.error(`Error setting theme ${themeId}: ${err}`));
  }

  onClickNewVersion() {
    const { model, viewAllCourses } = this.props;
    const { newVersionNumber, isNewVersionValid } = this.state;

    if (isNewVersionValid) {
      // Reparse version number to remove spaces/other formatting issues in the raw input string
      return persistence.createNewVersion(
        model.guid, this.parseVersionNumber(newVersionNumber).join('.'))
        .then(viewAllCourses);
    }
  }

  parseVersionNumber(versionNumber: string) {
    return versionNumber.split('.').map(s => parseInt(s, 10));
  }

  validateVersionNumber(newVersionNumber: string) {
    // Validate version number under semantic versioning syntax
    // Valid version numbers are major minor (1.1) or major minor patch (1.1.0)
    const isValid = parsed => (parsed.length === 2 || parsed.length === 3)
      && parsed.find(isNaN) === undefined;

    this.setState({ newVersionNumber }, () => {

      if (isValid(this.parseVersionNumber(newVersionNumber))) {
        this.setState({ isNewVersionValid: true });
      } else {
        this.setState({ isNewVersionValid: false });
      }
    });
  }

  removePackage() {
    persistence.deleteCoursePackage(this.props.model.guid)
      .then((document) => {
        this.props.viewAllCourses();
      })
      .catch(err => console.error(err));
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

  renderDevelopers() {
    const developers = this.props.model.developers.toArray();

    return (
      <Typeahead
        disabled={!this.props.editMode}
        multiple
        renderMenuItemChildren={this.renderMenuItemChildren}
        onChange={this.onEditDevelopers}
        options={developers}
        labelKey={(d: UserInfo) => `${d.firstName} ${d.lastName} (${d.email})`}
        selected={this.state.selectedDevelopers}
      />
    );
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

  renderStatus() {
    const { model } = this.props;

    const statusIsActive = (status: DeploymentStatus) =>
      model.deploymentStatus === status ? 'active ' : '';

    const makeStep = (status: DeploymentStatus, title: string, description: string) =>
      <div className={statusIsActive(status) + 'step'}>
        <div className="content">
          <div className="title">{title}</div>
          <div className="description">{description}</div>
        </div>
      </div>;

    return (
      <div className="vertical steps">
        {isNullOrUndefined(model.deploymentStatus) ? <p>This course does not have a deployment
          status set. The 'development' actions will be shown as a default.</p> : null}
        {makeStep(
          DeploymentStatus.Development, 'Development',
          'This course package is still under active development and has not been deployed.')}
        {makeStep(
          DeploymentStatus.RequestingQA, 'QA Requested',
          'This course package has been requested to be deployed \
          to the QA server for final testing.')}
        {makeStep(
          DeploymentStatus.QA, 'QA',
          'This course package is ready to be reviewed before being \
          deployed publically to students.')}
        {makeStep(
          DeploymentStatus.RequestingProduction, 'Production Requested',
          'This course package has been requested to be deployed to production.')}
        {makeStep(
          DeploymentStatus.Production, 'Production',
          'This course package is live and available to students. Changes are limited.')}
      </div>
    );
  }

  renderActions() {
    const { model } = this.props;

    const requestQAButton = (redeploy: boolean) =>
      <RequestButton key="req-qa" text="Request QA" className="btn-secondary actionButton requestQA"
        onClick={() => this.onRequestDeployment(DeployStage.qa, redeploy)} />;

    const requestProductionButton = (redeploy: boolean) =>
      <RequestButton key="req-prod" text="Request Production"
        className="btn-secondary actionButton requestProd"
        onClick={() => this.onRequestDeployment(DeployStage.prod, redeploy)} />;

    const actions = [];

    switch (model.deploymentStatus) {
      case DeploymentStatus.Development:
        actions.push(
          <p key="development">If your course package is ready to go to QA, you can request
            for OLI to deploy the course to the QA server for public review.</p>,
          requestQAButton(false));
        break;

      case DeploymentStatus.RequestingQA:
        break;

      case DeploymentStatus.QA:
        actions.push(
          <p key="qa">If you've made changes to your course package since your last deployment
            to QA, you can request for OLI to redeploy the course to the QA server for further
            review.</p>,
          requestQAButton(true),
          <br />,
          <p>If your course package is ready to go to production, you can request for OLI to deploy
          the course to the production server for public use.</p>,
          requestProductionButton(false));
        break;

      case DeploymentStatus.RequestingProduction:
        break;

      case DeploymentStatus.Production:
        actions.push(
          <p key="production">This course package is available on the production server,
            but you can notify the OLI team to make non-structural updates to course content.</p>,
          requestProductionButton(true));
        break;

      // Many courses do not have the deployment status set - default to 'development' actions
      default:
        actions.push(requestQAButton(false));
        break;
    }

    if (actions.length === 0) {
      actions.push(
        <div key="none">No actions available in this deployment state.</div>,
      );
    }

    return actions;
  }

  onRequestDeployment(stage: DeployStage, redeploy: boolean) {
    const { model, courseChanged } = this.props;

    return persistence.requestDeployment(model.guid, stage, redeploy)
      .then((deployStatusObj) => {
        const deploymentStatus = (deployStatusObj as any).deployStatus;
        courseChanged(model.with({ deploymentStatus }));
      });
  }

  renderLicenseSelect() {
    const license = this.props.model.metadata.license;
    const licenseOptions = PackageLicenseTypes
      .map(l => <option key={l.acronym} value={l.url}>{l.description}</option>);

    const urls = PackageLicenseTypes.map(l => l.url);
    // Only show a link to the license if it's a CC license url, which
    // appears after the 'default' license type in the PackageLicenseTypes list
    const isCCUrl = urls.indexOf(license) > 0;

    return (
      <React.Fragment>
        <Select
          className="licenseSelect"
          editMode={this.props.editMode}
          value={license}
          onChange={this.onLicenseChange}>
          {licenseOptions}
        </Select> {isCCUrl ? <a title="License Summary" href={license} target="_blank">
          <i className="fas fa-external-link-alt" /></a> : null}
      </React.Fragment>
    );
  }

  onLicenseChange = (license: string) => {
    const model = this.props.model.with({ metadata: this.props.model.metadata.with({ license }) });
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
    const { model, analytics, onCreateDataset } = this.props;

    const isAdmin = hasRole('admin');

    let adminRow = null;

    if (isAdmin) {
      adminRow = <div>
        <div className="row">
          <div className="col-3">Administrator</div>
          <div className="col-9">
            <Button
              editMode
              type="outline-primary"
              onClick={() => persistence.skillsDownload(this.props.model.guid)}>
              <i className="fa fa-download" /> Download Skill Files
            </Button>
            &nbsp;&nbsp;
            <Button
              editMode
              type="outline-danger"
              onClick={this.displayRemovePackageModal}>
              Delete Course Package
            </Button>
            <br /><br />
            Create new package version&nbsp;
            <HelpPopover>
              You can create a copy of this course package as a new version, allowing you to develop
              content independently of the original. This is useful when you want to get started
              on the next generation of a course without changing an existing course that's already
              in use.
              <br />
              <br />
              New version numbers must adhere to&nbsp;
              {/* tslint:disable-next-line:max-line-length */}
              <a href="https://fullstack-developer.academy/what-is-semantic-versioning/#semanticversioninginnodejsnpm" target="_blank">Semantic Versioning</a> rules.
            </HelpPopover>
            <br />
            <br />
            <TextInput
              editMode={this.props.editMode && isAdmin}
              width="220px"
              label="New Version Number (e.g. 1.1)"
              type="text"
              value={this.state.newVersionNumber}
              onEdit={this.validateVersionNumber}
              hasError={this.state.newVersionNumber !== '' && !this.state.isNewVersionValid}
            />
            <br />
            <RequestButton text="Create Version" className="btn-primary createVersion"
              onClick={() => this.onClickNewVersion()} />
          </div>
        </div>
      </div>;
    }

    return (
      <div className="course-editor" >
        <div className="row info">
          <div className="col-md-12">
            <h2>Course Package</h2>
            <TabContainer labels={['Details', 'Workflow', 'Analytics']}>
              <Tab>
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
                    <div className="col-3">License <HelpPopover activateOnClick>
                      <div><img src={CC_LICENSES} />
                        <br /><br />
                        <a href="https://en.wikipedia.org/wiki/Creative_Commons_license"
                          target="_blank">
                          More information
                        </a>
                      </div>
                    </HelpPopover>
                    </div>
                    <div className="col-9">{this.renderLicenseSelect()}</div>
                  </div>
                  <hr />
                  <div className="row">
                    <div className="col-3">Unique ID</div>
                    <div className="col-9">{model.id}</div>
                  </div>
                  <div className="row">
                    <div className="col-3">Package Location</div>
                    <div className="col-9">{model.svnLocation}</div>
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
              </Tab>
              <Tab>
                <div className="infoContain">
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
                </div>
              </Tab>
              <Tab>
                <div className="infoContain">
                  <div className="row">
                    <div className="col-9">
                      {analytics.requestedDataSetId.caseOf({
                        just: () => (
                          <React.Fragment>
                            <LoadingSpinner>
                              Please wait while your new dataset is processed,
                              this might take a while.
                              <br/>
                              <br/>
                              You may continue to use the editor
                              while this operation is in progress.
                            </LoadingSpinner>
                          </React.Fragment>
                        ),
                        nothing: () => analytics.dataSet.caseOf({
                          just: dataSet => (
                            <React.Fragment>
                              Analytics displayed are from the latest dataset created
                              on <b>{dataSet.dateCreated}</b>.
                              To get the most recent student data for analytics, create a new
                              dataset.
                              <br />
                              <br />
                              <b>Notice:</b> Dataset creation may take a while. You may continue
                              to use the editor while the operation is in progress.
                            </React.Fragment>
                          ),
                          nothing: () => (
                            <React.Fragment>
                              No datasets have been created for this course package.
                              To see statistics about content effectiveness in the Course Author,
                              you must first create a dataset.
                            </React.Fragment>
                          ),
                        }),
                      })}
                    </div>
                    <div className="col-3">
                      <Button
                        editMode={this.props.editMode && analytics.requestedDataSetId.caseOf({
                          just: () => false,
                          nothing: () => true,
                        })}
                        onClick={() => onCreateDataset()}>
                        Create Dataset
                      </Button>
                    </div>
                  </div>
                </div>
              </Tab>
            </TabContainer>
          </div>
        </div>
      </div>
    );
  }
}

export default CourseEditor;
