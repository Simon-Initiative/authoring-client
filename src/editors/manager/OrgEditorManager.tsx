import * as React from 'react';
import * as Immutable from 'immutable';
import { UserProfile } from 'types/user';
import * as persistence from 'data/persistence';
import * as models from 'data/models';
import { configuration } from 'actions/utils/config';
import OrgEditor from 'editors/document/org/OrgEditor';
import { DispatchBasedServices } from 'editors/common/AppServices';
import { Resource } from 'data/content/resource';
import { LearningObjective, Skill } from 'data/contentTypes';
import * as org from 'data/models/utils/org';
import { Maybe } from 'tsmonad';
import { NavigationItem } from 'types/navigation';

import './OrgEditorManager.scss';
import * as Messages from 'types/messages';

export interface OrgEditorManagerProps {
  document: persistence.Document;
  hasFailed: boolean;
  documentId: string;
  userId: string;
  userName: string;
  profile: UserProfile;
  course: models.CourseModel;
  expanded: any;
  editingAllowed: boolean;
  undoRedoGuid: string;
  skills: Immutable.Map<string, Skill>;
  objectives: Immutable.Map<string, LearningObjective>;
  onDispatch: (...args: any[]) => any;
  onChange: (change: org.OrgChangeRequest) => any;
  canUndo: boolean;
  canRedo: boolean;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  dismissModal: () => void;
  displayModal: (c) => void;
  onUndo: (documentId: string) => void;
  onRedo: (documentId: string) => void;
  onEditingEnable: (editable: boolean, documentId: string) => void;
  selectedItem: Maybe<NavigationItem>;
}

export interface OrgEditorManagerState {
  waitBufferElapsed: boolean;
}

export default class OrgEditorManager
  extends React.PureComponent<OrgEditorManagerProps, OrgEditorManagerState> {

  waitBufferTimer: any;

  constructor(props) {
    super(props);
    this.onEdit = this.onEdit.bind(this);

    this.state = {
      waitBufferElapsed: false,
    };

    this.waitBufferTimer = setTimeout(
      () => {
        this.waitBufferTimer = null;
        this.setState({ waitBufferElapsed: true });
      },
      200);
  }

  onEdit(request: org.OrgChangeRequest) {
    const { onChange } = this.props;
    onChange(request);
  }

  determineBaseUrl(resource: Resource) {
    if (resource === undefined) return '';

    const pathTo = resource.fileNode.pathTo;
    const stem = pathTo
      .substr(pathTo.indexOf('content\/') + 8);
    return stem
      .substr(0, stem.lastIndexOf('\/'));
  }

  renderFailed() {
    return <span />;
  }

  renderLoaded(document: persistence.Document) {

    const { course, documentId, expanded, userId, onDispatch,
      editingAllowed, undoRedoGuid } = this.props;

    const courseId = (course as models.CourseModel).guid;

    return (
      <OrgEditor
        {...this.props}
        selectedItem={this.props.selectedItem}
        model={document.model as models.OrganizationModel}
        expanded={expanded.has(documentId)
          ? Maybe.just<Immutable.Set<string>>(expanded.get(documentId))
          : Maybe.nothing<Immutable.Set<string>>()}
        context={{
          orgId: documentId,
          documentId,
          userId,
          courseId,
          undoRedoGuid,
          resourcePath: this.determineBaseUrl((document.model as any).resource),
          baseUrl: configuration.protocol + configuration.hostname + '/webcontents',
          courseModel: course,
          skills: this.props.skills,
          objectives: this.props.objectives,
        }}
        dispatch={onDispatch}
        onEdit={this.onEdit}
        services={new DispatchBasedServices(
          onDispatch,
          course,
        )}
        editMode={editingAllowed}
      />
    );
  }


  renderLoading() {
    const waitingIcon = <i className="fa fa-circle-o-notch fa-spin fa-1x fa-fw" />;
    return (
      <div className="waiting-notification scale-in-center">
        {waitingIcon}
      </div>
    );
  }


  render(): JSX.Element {

    const { document, hasFailed } = this.props;

    let component = null;

    if (hasFailed) {
      component = this.renderFailed();
    } else if (document === null && this.state.waitBufferElapsed) {
      component = this.renderLoading();
    } else if (document !== null) {
      component = this.renderLoaded(document);
    } else {
      component = <span />;
    }

    return (
      <div className="org-editor-manager">
        {component}
      </div>
    );
  }
}
