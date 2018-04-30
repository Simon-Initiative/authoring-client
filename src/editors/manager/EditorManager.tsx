import * as React from 'react';
import * as Immutable from 'immutable';
import { UserProfile } from 'types/user';
import * as persistence from 'data/persistence';
import * as models from 'data/models';
import { configuration } from 'actions/utils/config';
import { AbstractEditorProps } from '../document/common/AbstractEditor';
import { DispatchBasedServices } from '../common/AppServices';
import { Resource } from 'data/content/resource';
import { Maybe } from 'tsmonad';
import { lookUpByName } from 'editors/manager/registry';
import { LearningObjective, Skill } from 'data//contentTypes';
import { ActiveContextState } from 'reducers/active';

import './EditorManager.scss';

export interface EditorManagerProps {
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
  onSave: (documentId: string, model: models.ContentModel) => any;

  activeContext: ActiveContextState;
  onCut: (item: Object) => void;
  onCopy: (item: Object) => void;
  onPaste: () => void;
}

export interface EditorManagerState {
  waitBufferElapsed: boolean;
}

export default class EditorManager
  extends React.PureComponent<EditorManagerProps, EditorManagerState> {

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

  componentDidMount() {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'c' && (event.ctrlKey || event.metaKey)) {
        console.log('copy');
        if (!(event.target as any).contenteditable) {
          console.log('content not editable');
          event.preventDefault();
          event.stopPropagation();
          this.props.onCopy(this.getItem());
        }
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'v' && (event.ctrlKey || event.metaKey)) {
        console.log('paste', event, (event.target as any).isContentEditable);
        // this doesn't work. how to restrict pasting when text is selected?
        if (!(event.target as any).contenteditable) {
          console.log('content not editable');
          event.preventDefault();
          event.stopPropagation();
          this.props.onPaste();
        }
      }
    });
  }

  getItem() {
    const { activeContext } = this.props;
    return activeContext.activeChild.caseOf({
      just: activeChild => activeChild,
      nothing: () => undefined,
    });
  }

  onEdit(model: models.ContentModel) {

    const { onSave, documentId } = this.props;

    onSave(documentId, model);
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
    return <span/>;
  }

  renderLoaded(document: persistence.Document) {

    const { course, documentId, expanded, userId, onDispatch,
      editingAllowed, undoRedoGuid } = this.props;

    const courseId = (course as models.CourseModel).guid;

    const childProps: AbstractEditorProps<any> = {
      model: document.model,
      expanded: expanded.has(documentId)
        ? Maybe.just<Immutable.Set<string>>(expanded.get(documentId))
        : Maybe.nothing<Immutable.Set<string>>(),
      context: {
        documentId,
        userId,
        courseId,
        undoRedoGuid,
        resourcePath: this.determineBaseUrl((document.model as any).resource),
        baseUrl: configuration.protocol + configuration.hostname + '/webcontents',
        courseModel: course,
        skills: this.props.skills,
        objectives: this.props.objectives,
      },
      dispatch: onDispatch,
      onEdit: this.onEdit,
      services: new DispatchBasedServices(
        onDispatch,
        course,
      ),
      editMode: editingAllowed,
    };

    const registeredEditor = lookUpByName(document.model.modelType);
    return React.createElement((registeredEditor.component as any), childProps);
  }


  renderLoading() {
    return (
      <div className="container waiting-notification">
        <div className="row">
          <div className="col-2">
            &nbsp;
          </div>
          <div className="col-8">
            <div className="alert alert-info" role="alert">
              <strong>Please wait.</strong> Loading the course material.
            </div>
          </div>
          <div className="col-2">
            &nbsp;
          </div>
        </div>

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
      component = <span/>;
    }

    return (
      <div className="editor-manager">
        {component}
      </div>
    );
  }
}
