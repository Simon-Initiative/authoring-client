import * as React from 'react';
import * as Immutable from 'immutable';
import { bindActionCreators } from 'redux';
import { returnType } from '../../utils/types';
import { connect } from 'react-redux';

import * as persistence from '../../data/persistence';
import * as models from '../../data/models';
import * as courseActions from '../../actions/course';
import guid from '../../utils/guid';
import { configuration } from '../../actions/utils/config';
import { AbstractEditorProps } from '../document/common/AbstractEditor';
import { AppServices, DispatchBasedServices } from '../common/AppServices';

import { onFailureCallback, onSaveCompletedCallback, 
    PersistenceStrategy } from './persistence/PersistenceStrategy';
import { LockDetails, renderLocked } from '../../utils/lock';
import { ListeningApproach } from './ListeningApproach';
import { lookUpByName } from './registry';
import { Resource } from '../../data/content/resource';
import { Maybe } from 'tsmonad';

interface EditorManager {

  componentDidUnmount: boolean;

  persistenceStrategy: PersistenceStrategy;

  onSaveCompleted: onSaveCompletedCallback;

  onSaveFailure: onFailureCallback;

  stopListening: boolean;

  _onEdit: (model: models.ContentModel) => void;

  waitBufferTimer: any;
}

export interface EditorManagerState {
  editingAllowed: boolean;
  document: persistence.Document;
  failure: string;
  waitBufferElapsed: boolean;
  activeSubEditorKey: string;
  undoRedoGuid: string;
}

function mapStateToProps(state: any) {
  const {
    titles,
    expanded,
  } = state;

  return {
    titles,
    expanded,
  };
}

interface EditorManagerOwnProps {

  documentId: string;

  userId: string;

  userName: string;

  course: any;
}

const stateGeneric = returnType(mapStateToProps);
type EditorManagerReduxProps = typeof stateGeneric;
type EditorManagerProps = EditorManagerReduxProps & EditorManagerOwnProps & { dispatch };

class EditorManager extends React.Component<EditorManagerProps, EditorManagerState> {

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
    this._onEdit = this.onEdit.bind(this);
    this.onUndoRedoEdit = this.onUndoRedoEdit.bind(this);

    this.onSaveCompleted = (doc: persistence.Document) => {

      if (!this.componentDidUnmount) {
        this.setState({ document: doc });
      }

    };

    this.onSaveFailure = (reason: any) => {

    };
  }

  onEdit(model: models.ContentModel) {
    const doc = this.state.document.with({ model });
    this.setState({ document: doc }, () => this.persistenceStrategy.save(doc));
  }

  onUndoRedoEdit(model: models.ContentModel) {
    const doc = this.state.document.with({ model });
    const undoRedoGuid = guid();
    this.setState({ document: doc, undoRedoGuid }, () => this.persistenceStrategy.save(doc));
  }


  initPersistence(document: persistence.Document) {

    this.persistenceStrategy = lookUpByName(document.model.modelType)
      .persistenceStrategyFactory();

    this.persistenceStrategy.initialize(
      document, this.props.userName,
      this.onSaveCompleted, this.onSaveFailure)
      .then((editingAllowed) => {

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
          this.props.dispatch(courseActions.courseChanged(document.model));
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
    
    if (this.props.documentId !== nextProps.documentId) {

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
    // Special handling for CourseModel  - don't call fetchDocument
    if (this.props.course && this.props.course.model.guid === this.props.documentId) {
      const document = new persistence.Document({
        _courseId: this.props.course.model.guid,
        _id: this.props.course.model.guid,
        _rev: this.props.course.model.rev,
        model: this.props.course.model,
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
    } else {
      if (this.props.course) {
        this.fetchDocument(this.props.course.model.guid, this.props.documentId);
      }
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
              <pre>{this.props.documentId}</pre>

              <p className="mb-0">Error:</p>
              <pre className="mb-0">{(this.state.failure as any).stack}</pre>
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
    if (this.state.failure !== null) {
      return this.renderError();
    } else if (this.state.document === null || this.state.editingAllowed === null) {
      
      if (this.state.waitBufferElapsed) {
        return this.renderWaiting();
      } else {
        return null;
      }
      
    } else {

      const courseId = (this.props.course.model as models.CourseModel).guid;
      const courseLabel = (this.props.course.model as models.CourseModel).id;
      const version = (this.props.course.model as models.CourseModel).version;

      const childProps: AbstractEditorProps<any> = {
        model: this.state.document.model,
        expanded: this.props.expanded.has(this.props.documentId) 
          ? Maybe.just<Immutable.Set<string>>(this.props.expanded.get(this.props.documentId)) 
          : Maybe.nothing<Immutable.Set<string>>(),
        context: {
          documentId: this.props.documentId,
          userId: this.props.userId,
          courseId,
          resourcePath: this.determineBaseUrl((this.state.document.model as any).resource),
          baseUrl: configuration.protocol + configuration.hostname + '/webcontents',
          courseModel: this.props.course.model,
          undoRedoGuid: this.state.undoRedoGuid,
        },
        dispatch: this.props.dispatch,
        onEdit: this._onEdit,
        onUndoRedoEdit: this.onUndoRedoEdit,
        services: new DispatchBasedServices(
          this.props.dispatch, 
          this.props.course.model, this.props.titles),
        editMode: this.state.editingAllowed,
      };

      const registeredEditor = lookUpByName(this.state.document.model.modelType);
      const editor = React.createElement((registeredEditor.component as any), childProps);

      return (
        <div>
          {this.state.editingAllowed ? null : 
            renderLocked(
              this.persistenceStrategy.getLockDetails())}
          {editor}
        </div>
      );
    }
  }

}

export default connect<EditorManagerReduxProps, {}, EditorManagerOwnProps>
  (mapStateToProps)(EditorManager);
