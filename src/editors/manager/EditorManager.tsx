import * as React from 'react';
import * as Immutable from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { UserProfile } from 'types/user';
import * as persistence from 'data/persistence';
import * as models from 'data/models';
import * as courseActions from 'actions/course';
import * as messageActions from 'actions/messages';
import * as Messages from 'types/messages';
import guid from 'utils/guid';
import { configuration } from 'actions/utils/config';
import { AbstractEditorProps } from '../document/common/AbstractEditor';
import { AppServices, DispatchBasedServices } from '../common/AppServices';
import {
  onFailureCallback,
  onSaveCompletedCallback,
  PersistenceStrategy,
} from './persistence/PersistenceStrategy';
import { LockDetails, buildLockExpiredMessage, buildReadOnlyMessage } from 'utils/lock';
import { buildReportProblemAction, buildPersistenceFailureMessage } from 'utils/error';
import { ListeningApproach } from './ListeningApproach';
import { lookUpByName } from './registry';
import { Resource } from 'data/content/resource';
import { Maybe } from 'tsmonad';
import { Skill, LearningObjective } from 'data//contentTypes';
import './EditorManager.scss';

export interface EditorManagerProps {
  documentId: string;
  userId: string;
  userName: string;
  profile: UserProfile;
  course: models.CourseModel;
  expanded: any;
  skills: Immutable.Map<string, Skill>;
  objectives: Immutable.Map<string, LearningObjective>;
  onCourseChanged: (model: models.CourseModel) => any;
  onDispatch: (...args: any[]) => any;
}

export interface EditorManagerState {
  editingAllowed: boolean;
  document: persistence.Document;
  failure: string;
  waitBufferElapsed: boolean;
  activeSubEditorKey: string;
  undoRedoGuid: string;
}

export default class EditorManager extends React.Component<EditorManagerProps, EditorManagerState> {
  componentDidUnmount: boolean;
  persistenceStrategy: PersistenceStrategy;
  onSaveCompleted: onSaveCompletedCallback;
  onSaveFailure: onFailureCallback;
  stopListening: boolean;
  waitBufferTimer: any;
  failedMessage: Messages.Message;

  constructor(props) {
    super(props);

    this.state = {
      failure: null,
      document: null,
      editingAllowed: null,
      activeSubEditorKey: null,
      waitBufferElapsed: false,
      undoRedoGuid: guid(),
    };

    this.failedMessage = null;
    this.componentDidUnmount = false;
    this.persistenceStrategy = null;
    this.onEdit = this.onEdit.bind(this);
    this.onUndoRedoEdit = this.onUndoRedoEdit.bind(this);
    this.onSaveCompleted = (doc: persistence.Document) => {
      if (this.failedMessage !== null) {
        this.props.onDispatch(messageActions.dismissSpecificMessage(this.failedMessage));
        this.failedMessage = null;
      }
    };
    this.onSaveFailure = (reason: any) => {
      if (reason === 'Forbidden') {

        const message = buildLockExpiredMessage({ label: 'Reload',
          execute: () => this.fetchDocument(this.props.course.guid, this.props.documentId)});

        this.props.onDispatch(messageActions.showMessage(message));
        this.setState({ editingAllowed: false });
      } else {
        this.failedMessage = buildPersistenceFailureMessage(reason);
        this.props.onDispatch(messageActions.showMessage(this.failedMessage));
      }
    };
  }

  onEdit(model: models.ContentModel) {
    const { document } = this.state;

    if (model.modelType !== 'CourseModel' && model.modelType !== 'MediaModel') {
      const resource = model.resource.with({ dateUpdated: new Date() });
      const resources = Immutable.OrderedMap<string, Resource>([[resource.guid, resource]]);
      this.props.onDispatch(courseActions.updateCourseResources(resources));
    }

    const doc = document.with({ model });
    this.setState({ document: doc }, () => this.persistenceStrategy.save(doc));
  }

  onUndoRedoEdit(model: models.ContentModel) {
    const { document } = this.state;

    if (model.modelType !== 'CourseModel' && model.modelType !== 'MediaModel') {
      const resource = model.resource.with({ dateUpdated: new Date() });
      const resources = Immutable.OrderedMap<string, Resource>([[resource.guid, resource]]);
      this.props.onDispatch(courseActions.updateCourseResources(resources));
    }

    const doc = document.with({ model });
    const undoRedoGuid = guid();
    this.setState({ undoRedoGuid, document: doc }, () => this.persistenceStrategy.save(doc));
  }

  initPersistence(document: persistence.Document) {
    const { userName } = this.props;

    this.persistenceStrategy = lookUpByName(document.model.modelType)
      .persistenceStrategyFactory();

    this.persistenceStrategy.initialize(
      document, userName,
      this.onSaveCompleted,
      this.onSaveFailure,
    ).then((editingAllowed) => {
      if (!this.componentDidUnmount) {
        this.setState({ editingAllowed });

        if (!editingAllowed) {

          const lockDetails = this.persistenceStrategy.getLockDetails();
          const message = buildReadOnlyMessage(lockDetails, { label: 'Reload',
            execute: () => this.fetchDocument(this.props.course.guid, this.props.documentId)});
          this.props.onDispatch(messageActions.showMessage(message));
        } else {
          this.props.onDispatch(messageActions.dismissScopedMessages(Messages.Scope.Resource));
        }

        const listeningApproach: ListeningApproach
          = lookUpByName(document.model.modelType).listeningApproach;

        if ((!editingAllowed && listeningApproach === ListeningApproach.WhenReadOnly) ||
          listeningApproach === ListeningApproach.Always) {

          this.stopListening = false;
        }
      }
    });
  }

  fetchDocument(courseId: string, documentId: string) {
    const { onCourseChanged } = this.props;

    if (this.waitBufferTimer !== null) {
      clearTimeout(this.waitBufferTimer);
    }
    this.waitBufferTimer = setTimeout(
      () => {
        this.waitBufferTimer = null;
        this.setState({ waitBufferElapsed: true });
      },
      200);

    persistence.retrieveDocument(courseId, documentId)
      .then((document) => {

        // Notify that the course has changed when a user views a course
        if (document.model.modelType === models.ModelTypes.CourseModel) {
          onCourseChanged(document.model);
        }

        // Tear down previous persistence strategy
        if (this.persistenceStrategy !== null) {
          this.persistenceStrategy.destroy()
            .then((nothing) => {
              this.initPersistence(document);
            });
        } else {
          this.initPersistence(document);
        }

        this.setState({ document });
      })
      .catch((failure) => {

        const content = new Messages.TitledContent().with({
          title: 'Cannot load resource.',
          message: 'There was a problem loading this course resource.',
        });

        const { profile } = this.props;
        const name = profile.firstName + ' ' + profile.lastName;

        this.failedMessage = new Messages.Message().with({
          content,
          scope: Messages.Scope.Resource,
          severity: Messages.Severity.Error,
          canUserDismiss: false,
          actions: Immutable.List([buildReportProblemAction(failure, name, profile.email)]),
        });
        this.props.onDispatch(messageActions.showMessage(this.failedMessage));

        this.setState({ failure });
      });
  }

  componentWillReceiveProps(nextProps) {
    const { documentId } = this.props;

    if (documentId !== nextProps.documentId) {

      this.stopListening = true;
      // Special processing if next document is a CourseModel - don't call fetchDocument
      if (nextProps.course && nextProps.course.guid === nextProps.documentId) {
        const document = new persistence.Document({
          _courseId: nextProps.course.guid,
          _id: nextProps.course.guid,
          _rev: nextProps.course.rev,
          model: nextProps.course,
        });
        // Tear down previous persistence strategy
        if (this.persistenceStrategy !== null) {
          this.persistenceStrategy.destroy()
            .then((nothing) => {
              this.initPersistence(document);
            });
        } else {
          this.initPersistence(document);
        }
        this.setState({ document, failure: null, waitBufferElapsed: false });
      } else {
        this.setState({ document: null, editingAllowed: null,
          failure: null, waitBufferElapsed: false });
        if (nextProps.course) {
          this.fetchDocument(nextProps.course.guid, nextProps.documentId);
        }
      }
    }
  }

  componentDidMount() {
    const { course, documentId } = this.props;

    // Special handling for CourseModel  - don't call fetchDocument
    if (course && course.guid === documentId) {
      const document = new persistence.Document({
        _courseId: course.guid,
        _id: course.guid,
        _rev: course.rev + '',
        model: course,
      });
      // Tear down previous persistence strategy
      if (this.persistenceStrategy !== null) {
        this.persistenceStrategy.destroy()
          .then((nothing) => {
            this.initPersistence(document);
          });
      } else {
        this.initPersistence(document);
      }
      this.setState({ document });
    } else if (course) {
      this.fetchDocument(course.guid, documentId);
    }
  }

  componentWillUnmount() {
    this.stopListening = true;
    this.componentDidUnmount = true;
    if (this.persistenceStrategy !== null) {
      this.persistenceStrategy.destroy();
    }
  }

  determineBaseUrl(resource: Resource) {
    if (resource === undefined) return '';

    const pathTo = resource.fileNode.pathTo;
    const stem = pathTo
      .substr(pathTo.indexOf('content\/') + 8);
    return stem
      .substr(0, stem.lastIndexOf('\/'));
  }

  renderWaiting() {
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
    const { course, documentId, expanded, userId, onDispatch } = this.props;
    const {
      document,
      editingAllowed,
      failure,
      undoRedoGuid,
      waitBufferElapsed,
    } = this.state;

    if (failure !== null) {
      return null;
    }
    if (document === null || editingAllowed === null) {
      if (waitBufferElapsed) {
        return this.renderWaiting();
      }
      return null;
    }
    const courseId = (course as models.CourseModel).guid;
    const courseLabel = (course as models.CourseModel).id;
    const version = (course as models.CourseModel).version;

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
      onUndoRedoEdit: this.onUndoRedoEdit,
      services: new DispatchBasedServices(
        onDispatch,
        course,
      ),
      editMode: editingAllowed,
    };

    const registeredEditor = lookUpByName(document.model.modelType);
    const editor = React.createElement((registeredEditor.component as any), childProps);

    return (
      <div className="editor-manager">
        {editor}
      </div>
    );
  }
}
