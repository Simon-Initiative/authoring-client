import * as React from 'react';
import * as Immutable from 'immutable';
import { bindActionCreators } from 'redux';
import { returnType } from 'app/utils/types';
import { connect } from 'react-redux';
import { UserProfile } from 'app/types/user';
import * as persistence from 'app/data/persistence';
import * as models from 'app/data/models';
import * as courseActions from 'app/actions/course';
import guid from 'app/utils/guid';
import { configuration } from 'app/actions/utils/config';
import { AbstractEditorProps } from '../document/common/AbstractEditor';
import { AppServices, DispatchBasedServices } from '../common/AppServices';
import { buildFeedbackFromCurrent } from 'app/utils/feedback';
import {
  onFailureCallback,
  onSaveCompletedCallback,
  PersistenceStrategy,
} from './persistence/PersistenceStrategy';
import { LockDetails, renderLocked } from 'app/utils/lock';
import { ListeningApproach } from './ListeningApproach';
import { lookUpByName } from './registry';
import { Resource } from 'app/data/content/resource';
import { Maybe } from 'tsmonad';

export interface EditorManagerProps {
  documentId: string;
  userId: string;
  userName: string;
  profile: UserProfile;
  course: any;
  expanded: any;
  titles: any;
  onCourseChanged: (model: models.CourseModel) => any;
  onLoadCourseTitles: (courseId: string) => any;
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

export default interface EditorManager {
  componentDidUnmount: boolean;
  persistenceStrategy: PersistenceStrategy;
  onSaveCompleted: onSaveCompletedCallback;
  onSaveFailure: onFailureCallback;
  stopListening: boolean;
  waitBufferTimer: any;
}

export default class EditorManager extends React.Component<EditorManagerProps, EditorManagerState> {
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

    this.componentDidUnmount = false;
    this.persistenceStrategy = null;
    this.onEdit = this.onEdit.bind(this);
    this.onUndoRedoEdit = this.onUndoRedoEdit.bind(this);
    this.onSaveCompleted = (doc: persistence.Document) => {};
    this.onSaveFailure = (reason: any) => {
      if (reason === 'Forbidden') {
        this.setState({ editingAllowed: false });
      }
    };
  }

  onEdit(model: models.ContentModel) {
    const { document } = this.state;

    const doc = document.with({ model });
    this.setState({ document: doc }, () => this.persistenceStrategy.save(doc));
  }

  onUndoRedoEdit(model: models.ContentModel) {
    const { document } = this.state;

    const doc = document.with({ model });
    const undoRedoGuid = guid();
    this.setState({ document: doc, undoRedoGuid }, () => this.persistenceStrategy.save(doc));
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

        const listeningApproach: ListeningApproach
          = lookUpByName(document.model.modelType).listeningApproach;

        if ((!editingAllowed && listeningApproach === ListeningApproach.WhenReadOnly) ||
          listeningApproach === ListeningApproach.Always) {

          this.stopListening = false;
          this.listenForChanges();
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
        this.setState({ failure });
      });
  }

  componentWillReceiveProps(nextProps) {
    const { documentId } = this.props;

    if (documentId !== nextProps.documentId) {

      this.stopListening = true;
      // Special processing if next document is a CourseModel - don't call fetchDocument
      if (nextProps.course && nextProps.course.model.guid === nextProps.documentId) {
        const document = new persistence.Document({
          _courseId: nextProps.course.model.guid,
          _id: nextProps.course.model.guid,
          _rev: nextProps.course.model.rev,
          model: nextProps.course.model,
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
          this.fetchDocument(nextProps.course.model.guid, nextProps.documentId);
        }
      }
    }
  }

  componentDidMount() {
    const { course, documentId, onLoadCourseTitles } = this.props;

    // Special handling for CourseModel  - don't call fetchDocument
    if (course && course.model.guid === documentId) {
      const document = new persistence.Document({
        _courseId: course.model.guid,
        _id: course.model.guid,
        _rev: course.model.rev,
        model: course.model,
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
      this.fetchDocument(course.model.guid, documentId);
      onLoadCourseTitles(course.model.guid);
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

  listenForChanges() {
    // persistence.listenToDocument(this.state.document)
    //     .then(document => {
    //         if (!this.stopListening) {
    //
    //             this.setState({document});
    //
    //             this.listenForChanges();
    //         }
    //
    //     })
    //     .catch(err => {
    //         if (!this.stopListening) {
    //             this.listenForChanges();
    //         }
    //     })
  }

  renderWaiting() {
    return (
      <div className="container">
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

  renderError() {
    const { documentId, profile } = this.props;
    const { failure } = this.state;

    const url = buildFeedbackFromCurrent(
      profile.firstName + ' ' + profile.lastName,
      profile.email,
    );

    return (
      <div className="container">
        <div className="row">
          <div className="col-2">
            &nbsp;
          </div>
          <div className="col-8">
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Problem encountered!</h4>
              <p>
                A problem was encountered while trying to render the
                course material.
              </p>
              <p className="mb-0">Resource id:</p>
              <pre>{documentId}</pre>

              <p className="mb-0">Error:</p>
              <pre className="mb-0">{failure}</pre>
              <br/>
              <br/>
              <a target="_blank" href={url}>Report this Error</a>
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
    const { course, documentId, expanded, userId, titles, onDispatch } = this.props;
    const {
      document,
      editingAllowed,
      failure,
      undoRedoGuid,
      waitBufferElapsed,
    } = this.state;

    if (failure !== null) {
      return this.renderError();
    } else if (document === null || editingAllowed === null) {
      if (waitBufferElapsed) {
        return this.renderWaiting();
      } else {
        return null;
      }
    } else {
      const courseId = (course.model as models.CourseModel).guid;
      const courseLabel = (course.model as models.CourseModel).id;
      const version = (course.model as models.CourseModel).version;

      const childProps: AbstractEditorProps<any> = {
        model: document.model,
        expanded: expanded.has(documentId)
          ? Maybe.just<Immutable.Set<string>>(expanded.get(documentId))
          : Maybe.nothing<Immutable.Set<string>>(),
        context: {
          documentId,
          userId,
          courseId,
          resourcePath: this.determineBaseUrl((document.model as any).resource),
          baseUrl: configuration.protocol + configuration.hostname + '/webcontents',
          courseModel: course.model,
          undoRedoGuid,
          titles,
        },
        dispatch: onDispatch,
        onEdit: this.onEdit,
        onUndoRedoEdit: this.onUndoRedoEdit,
        services: new DispatchBasedServices(
          onDispatch,
          course.model,
        ),
        editMode: editingAllowed,
      };

      const registeredEditor = lookUpByName(document.model.modelType);
      const editor = React.createElement((registeredEditor.component as any), childProps);

      return (
        <div>
          {editingAllowed ?
            null
            : renderLocked(this.persistenceStrategy.getLockDetails())
          }
          {editor}
        </div>
      );
    }
  }
}
