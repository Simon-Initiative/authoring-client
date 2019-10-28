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
import * as viewActions from 'actions/view';
import ModalPrompt from 'utils/selection/ModalPrompt';
import { DeploymentStatus, DeployStage } from 'data/models/course';
import { LegacyTypes, CourseId, CourseIdVers } from 'data/types';
import { ResourceState, Resource } from 'data/content/resource';
import { Title } from 'components/objectives/Title';
import { HelpPopover } from 'editors/common/popover/HelpPopover.controller';
import { TextInput } from 'editors/content/common/controls';
import { isNullOrUndefined } from 'util';
import { PackageLicenseTypes } from 'data/content/learning/common';
import { TabContainer, Tab } from 'components/common/TabContainer';
import { AnalyticsState } from 'reducers/analytics';
import { LoadingSpinner } from 'components/common/LoadingSpinner';
import { parseDate, dateFormatted } from 'utils/date';
import { DatasetStatus } from 'types/analytics/dataset';
import { reportError } from 'utils/feedback';
import { UserState } from 'reducers/user';
import flatui from 'styles/palettes/flatui';
import { Maybe } from 'tsmonad';
import * as Messages from 'types/messages';
import { buildGeneralErrorMessage } from 'utils/error';
import { configuration } from 'actions/utils/config';
import ResourceView from 'components/resourceview/ResourceView';
import OrgLibrary from 'components/OrgLibrary';
import { updateActiveOrgPref } from 'actions/utils/activeOrganization';
import { localeCodes } from 'data/content/learning/foreign';

// const THUMBNAIL = require('../../../../assets/ph-courseView.png');
const CC_LICENSES = require('../../../../assets/cclicenses.png');

export interface CourseEditorProps {
  user: UserState;
  model: models.CourseModel;
  editMode: boolean;
  analytics: AnalyticsState;
  currentOrgDoc: persistence.Document;
  dispatch: any;
  courseChanged: (m: models.CourseModel) => any;
  viewAllCourses: () => any;
  onDisplayModal: (component: any) => void;
  onDismissModal: () => void;
  onShowMessage: (message: Messages.Message) => void;
  onCreateDataset: () => void;
  onCreateOrg: (title: string) => void;
  onLoadOrg: (courseId: CourseIdVers, documentId: string) => Promise<Document>;
  onReleaseOrg: () => void;
}

type ThemeSelection = {
  id: string,
  selected: boolean,
  thumbnail: string,
  image: string,
};

interface CourseEditorState {
  selectedDevelopers: UserInfo[];
  themes: ThemeSelection[];
  selectedOrganizationId: string;
  newVersionNumber: string;
  isNewVersionValid: boolean;
  newVersionErrorMessage: string;
  showAdvancedDetails: boolean;
}

interface RequestButtonProps { text: string; className: string; onClick: () => Promise<any>; }
interface RequestButtonState { pending: boolean; successful: boolean; failed: boolean; }
export class RequestButton extends React.Component<RequestButtonProps, RequestButtonState> {
  state = {
    ...this.state,
    pending: false,
    successful: false,
    failed: false,
  };

  onClickWithState = () => {
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
      <span className="RequestButton">
        <button
          style={{ marginRight: '5px' }}
          className={`btn ${className}`}
          onClick={this.onClickWithState()}>
          {text}
          {children}
        </button>
        {pending
          ? <i className="fas fa-circle-notch fa-spin fa-1x fa-fw"
            style={{ color: flatui.peterRiver, marginLeft: 4 }} />
          : null}
        {successful
          ? <i className="fas fa-check-circle"
            style={{ color: flatui.emerald, marginLeft: 4 }} />
          : null}
        {failed
          ? <i className="fas fa-times-circle"
            style={{ color: flatui.pomegranite, marginLeft: 4 }} />
          : null}
      </span>
    );
  }
}

class CourseEditor extends React.Component<CourseEditorProps, CourseEditorState> {

  organizations: Resource[] = [];

  state = {
    ...this.state,
    selectedDevelopers: this.props.model.developers.filter(d => d.isDeveloper).toArray(),
    themes: [],
    selectedOrganizationId: '',
    newVersionNumber: '',
    isNewVersionValid: false,
    newVersionErrorMessage: '',
  };

  componentDidMount() {
    this.fetchGlobalThemes();
    this.organizations = this.props.model.resources
      .filter((resource: Resource) =>
        resource.type === LegacyTypes.organization &&
        resource.resourceState !== ResourceState.DELETED)
      .toArray();
    this.toggleAdvancedDetails = this.toggleAdvancedDetails.bind(this);
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
            ...theme,
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

  onTitleEdit = (title) => {
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

  onDescriptionEdit = (description) => {
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

  onEditDevelopers = (developers: UserInfo[]) => {
    // For some reason the onChange callback for the Typeahead executes
    // twice for each UI-driven edit.  This check short-circuits the
    // second call.
    if (developers.length === this.state.selectedDevelopers.length) {
      return;
    }

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
        persistence.developerRegistration(this.props.model.idvers, changes, action)
          .catch((err) => {
            // We need to handle this better.  This editor should be managed
            // by the EditorManager
            this.props.onShowMessage(
              buildGeneralErrorMessage('Error adding developer: ' + err.message));
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

  onEditTheme = (themeId: string) => {
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
      .catch((err) => {
        this.props.onShowMessage(
          buildGeneralErrorMessage(`Error setting theme ${themeId}: ${err.message}`));
      });
  }

  onCreateNewVersion = () => {
    const { model, viewAllCourses } = this.props;
    const { newVersionNumber, isNewVersionValid } = this.state;

    if (isNewVersionValid) {
      // Reparse version number to remove spaces/other formatting issues in the raw input string
      return persistence.createNewVersion(
        model.guid, this.parseVersionNumber(newVersionNumber).join('.'))
        .then(viewAllCourses)
        .catch((err) => {
          this.setState({ newVersionErrorMessage: err.message });
          // Reject promise just to set the failure icon of the create version button
          return Promise.reject();
        });
    }

    return Promise.reject();
  }

  parseVersionNumber(versionNumber: string) {
    return versionNumber.split('.').map(s => parseInt(s, 10));
  }

  onValidateVersionNumber = (newVersionNumber: string) => {
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
    const { viewAllCourses, onShowMessage } = this.props;

    persistence.deleteCoursePackage(this.props.model.idvers)
      .then(document => viewAllCourses())
      .catch(err => onShowMessage(
        buildGeneralErrorMessage(`Error removing package: ${err.message}`)));
  }

  onDisplayRemovePackageModal = () => {
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
      <React.Fragment>
        <div style={{ marginBottom: 10 }}>
          You can add your team members here to allow them to edit this course.
        </div>
        <label htmlFor="team"
          style={{ color: '#aaa', fontWeight: 600, fontSize: '0.9rem', marginBottom: 0 }}>
          Enter a user's name or email...
        </label>
        <Typeahead
          inputProps={{ id: 'team' }}
          disabled={!this.props.editMode}
          multiple
          renderMenuItemChildren={this.onRenderMenuItemChildren}
          onChange={this.onEditDevelopers}
          options={developers}
          labelKey={(d: UserInfo) => `${d.firstName} ${d.lastName} (${d.email})`}
          selected={this.state.selectedDevelopers}
        />
      </React.Fragment>
    );
  }

  onRenderMenuItemChildren = (dev: UserInfo, props, index) => {
    const name = dev.firstName + ' ' + dev.lastName;
    return [
      <strong key="name">{name}</strong>,
      <div key="email">
        <small>{dev.email}</small>
      </div>,
    ];
  }

  renderForeignLanguageAccessibility = () => {
    if (localStorage.getItem('foreign-language-accessibility') !== 'true') {
      return null;
    }

    const languageOptions = Object.entries(localeCodes)
      .map(([code, friendly]) => <option key={code} value={code}>{friendly}</option>);

    return (
      <div className="row">
        <div className="col-3">
          Accessibility
          <br />
          (Default Language)
          <br />
          <HelpPopover>
            <div>
              This allows you to set the default language of "Foreign" elements
              in workbook pages and assessments.
              <br /><br />
              Text inside a Foreign element
              allows screen readers to provide the correct accent and pronunciation
              for students.
            </div>
          </HelpPopover>
        </div>
        <div className="col-9">
          <Select
            className="localeSelect"
            editMode={this.props.editMode}
            value={this.props.model.language.valueOr(null)}
            onChange={this.onChangeLanguage}>
            {languageOptions}
          </Select>
        </div>
      </div>
    );
  }

  onChangeLanguage = (localeCode: string) => {
    const model = this.props.model.with({
      language: localeCode ? Maybe.just(localeCode) : Maybe.nothing<string>(),
    });
    this.props.courseChanged(model);
    const doc = new Document().with({
      _courseId: model.guid,
      _id: model.id,
      _rev: model.rev.toString(),
      model,
    });
    persistence.persistDocument(doc);
  }

  renderThemes() {
    const { themes } = this.state;

    const urlPrefix = configuration.protocol + configuration.hostname + '/';

    const cursor = 'pointer';
    const marginLeft = '15px';

    const selected = {
      borderWidth: 8,
      border: 'solid',
      borderColor: 'blue',
      cursor,
      marginLeft,
    };

    const notSelected = {
      borderWidth: 8,
      border: 'solid',
      borderColor: 'lightgray',
      cursor,
      marginLeft,
      opacity: 0.5,
    };

    const toImage = (theme: ThemeSelection) =>
      <div className="d-flex flex-column">
        <img
          style={theme.selected ? selected : notSelected}
          onClick={this.onEditTheme.bind(this, theme.id)}
          key={theme.id}
          src={urlPrefix + theme.thumbnail} />
        <div style={{ textAlign: 'center' }}>{theme.id}</div>
      </div>;

    const images = themes.map(toImage);

    return (
      <div>
        <p>Select the look and feel for the course when viewed from
          a student and instructor perspective.
        </p>
        <div className="d-flex flex-row">
          {images}
        </div>
      </div>
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

  onRequestDeployment = (stage: DeployStage, redeploy: boolean) => {
    const { model, courseChanged, onShowMessage } = this.props;

    return persistence.requestDeployment(model.guid, stage, redeploy)
      .then((deployStatusObj) => {
        const deploymentStatus = (deployStatusObj as any).deployStatus;
        courseChanged(model.with({ deploymentStatus }));
      })
      .catch(err => onShowMessage(buildGeneralErrorMessage(
        `There was an error requesting course deployment: ${err.message}`)));
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
          onChange={this.onChangeLicense}>
          {licenseOptions}
        </Select> {isCCUrl ? <a title="License Summary" href={license} target="_blank">
          <i className="fas fa-external-link-alt" /></a> : null}
      </React.Fragment>
    );
  }

  onChangeLicense = (license: string) => {
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

  renderNewVersionValidationError() {
    const { newVersionNumber, isNewVersionValid } = this.state;

    let content: JSX.Element = null;

    if (newVersionNumber !== '' && !isNewVersionValid) {
      content = <span>Should look like <code>1.1</code> or <code>1.1.1</code></span>;
    }

    return <div className="localized-error">{content}</div>;
  }

  renderNewVersionCreationError() {
    const { newVersionErrorMessage } = this.state;

    return <div className="localized-error">{newVersionErrorMessage}</div>;
  }

  renderAdminDetails() {
    return (
      <div className="row">
        <div className="col-3">Administrator</div>
        <div className="col-9">
          <Button
            editMode
            type="outline-primary"
            onClick={() => persistence.skillsDownload(this.props.model.idvers)}>
            <i className="fa fa-download" /> Download Skill Files
          </Button>
          &nbsp;&nbsp;
          <Button
            editMode
            type="outline-danger"
            onClick={this.onDisplayRemovePackageModal}>
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
            editMode={this.props.editMode}
            width="220px"
            label="New Version Number (e.g. 1.1)"
            type="text"
            value={this.state.newVersionNumber}
            onEdit={this.onValidateVersionNumber}
            hasError={this.state.newVersionNumber !== '' && !this.state.isNewVersionValid}
          />
          {/* Two error locations for new version - syntax validations (performed locally),
          and server errors when the form is submitted */}
          {this.renderNewVersionValidationError()}
          <RequestButton text="Create Version" className="btn-primary createVersion"
            onClick={this.onCreateNewVersion} />
          {this.renderNewVersionCreationError()}
        </div>
      </div>
    );
  }

  // Either Show or Hide the Advanced options in the Details page
  toggleAdvancedDetails() {
    this.setState({
      showAdvancedDetails: !this.state.showAdvancedDetails,
    });
  }

  renderDetails() {
    const { model } = this.props;

    const isAdmin = hasRole('admin');

    const collapseIndicator = this.state.showAdvancedDetails ? '-' : '+';

    return (
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
        {this.renderForeignLanguageAccessibility()}

        {
          // Note that the implementation of this toggle is very similar to the
          // Collapse element. But this required too many changes to Collapse code.
        }
        <div className="row">
          <div className="col-3">
            <button
              type="button"
              className="btn btn-link"
              onClick={() => this.toggleAdvancedDetails()}>
              Advanced Details {collapseIndicator}
            </button>
          </div>
          <div className="col-9"></div>
        </div>
        {this.state.showAdvancedDetails &&
          <div className="advanced">
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
            <div className="row">
              <div className="col-3">Unique ID</div>
              <div className="col-9">{model.id}</div>
            </div>
            <div className="row">
              <div className="col-3">Package Location</div>
              <div className="col-9">{model.svnLocation}</div>
            </div>
          </div>
        }

        <hr />
        {/* <div className="row">
          <div className="col-3">Thumbnail<br /><br />
          </div>
          <div className="col-9">
            <img src={THUMBNAIL} className="img-fluid" alt=""></img>
          </div>
        </div> */}
        {isAdmin && this.renderAdminDetails()}
      </div>
    );
  }

  renderWorkflow() {
    return (
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
    );
  }

  renderProcessingAnalyticsMsg() {
    return (
      <React.Fragment>
        <LoadingSpinner>
          Please wait while your new dataset is created, this might take a while.
          <br />
          <br />
          You may continue to use the editor while this operation is in progress.
        </LoadingSpinner>
      </React.Fragment>
    );
  }

  renderResources() {
    const { model, currentOrgDoc, dispatch } = this.props;

    const org =
      currentOrgDoc !== null
        ? (currentOrgDoc.model as models.OrganizationModel).id
        : null;

    return (
      <ResourceView
        course={model}
        dispatch={dispatch}
        currentOrg={org}
        serverTimeSkewInMs={0}
      />
    );
  }

  renderAnalytics() {
    const { user, analytics, onCreateDataset, editMode, model } = this.props;

    return (
      <div className="infoContain">
        <div className="row">
          <div className="col-9">
            {analytics.requestedDataSetId.caseOf({
              just: () => this.renderProcessingAnalyticsMsg(),
              nothing: () => analytics.dataSet.caseOf({
                just: dataSet => dataSet.status === DatasetStatus.PROCESSING
                  ? this.renderProcessingAnalyticsMsg()
                  : dataSet.status === DatasetStatus.FAILED
                    ? (
                      <React.Fragment>
                        <i className="fa fa-times-circle" style={{ marginRight: 5 }} />
                        <b>Dataset Creation Failed</b>
                        <br />
                        {dataSet.message
                          ? dataSet.message
                          : 'Something went wrong while creating a new dataset for this course.'}
                        <br />
                        <br />
                        If you don't think you should be seeing this issue,
                        please report it to to OLI support.
                        <br />
                        <br />
                        <Button
                          editMode={true}
                          type="secondary"
                          style={{ marginLeft: 10 }}
                          onClick={() => reportError(user)}>
                          Report this problem
                      </Button>
                      </React.Fragment>
                    )
                    : (
                      // tslint:disable-next-line:max-line-length
                      <div><p>Analytics for this course are based on the latest dataset, which was created <b>{dateFormatted(parseDate(dataSet.dateCreated))}</b>. To get the most recent data for analytics, create a new dataset.</p><p><b>Notice:</b> Dataset creation may take a few minutes depending on the size of the course. You may continue to use the editor while the operation is in progress.</p></div>
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
              editMode={editMode && analytics.requestedDataSetId.caseOf({
                just: () => false,
                nothing: () => true,
              })}
              onClick={() => onCreateDataset()}>
              Create Dataset
            </Button>
            {analytics.dataSet
              .bind(dataSet => dataSet.status === DatasetStatus.DONE
                ? Maybe.just({})
                : Maybe.nothing())
              .caseOf({
                just: _ => <div>< br />
                  <br />
                  <Button
                    className="btn btn-secondary"
                    editMode={editMode &&
                      model.activeDataset !== null && model.activeDataset !== undefined}
                    onClick={() => persistence.downloadDataset(
                      model.activeDataset.guid, model.title, model.version)}>
                    Download Dataset
                </Button>
                </div>,
                nothing: () => null,
              })}
          </div>
        </div>
      </div>
    );
  }

  onSelectOrg = (orgId: string) => {
    const course = this.props.model;
    const profile = this.props.user.profile;

    this.props.onReleaseOrg();
    updateActiveOrgPref(course.idvers, profile.username, orgId);
    this.props.onLoadOrg(course.guid, orgId);
    viewActions.viewCourse(course.idvers, Maybe.just(orgId));
  }

  renderOrgs() {
    const org = this.props.currentOrgDoc !== null
      ? (this.props.currentOrgDoc.model as models.OrganizationModel).resource
      : null;
    return (
      <OrgLibrary
        course={this.props.model}
        currentOrg={org}
        onCreateOrg={this.props.onCreateOrg}
        onSelectOrg={this.onSelectOrg}
      />
    );
  }

  render() {
    return (
      <div className="course-editor" >
        <div className="row info">
          <div className="col-md-12">
            <h2>Course Details</h2>
            <TabContainer labels={
              ['Details', 'Workflow', 'Analytics', 'Resources', 'Organizations']}>
              <Tab>
                {this.renderDetails()}
              </Tab>
              <Tab>
                {this.renderWorkflow()}
              </Tab>
              <Tab>
                {this.renderAnalytics()}
              </Tab>
              <Tab>
                {this.renderResources()}
              </Tab>
              <Tab>
                {this.renderOrgs()}
              </Tab>
            </TabContainer>
          </div>
        </div>
      </div>
    );
  }
}

export default CourseEditor;
