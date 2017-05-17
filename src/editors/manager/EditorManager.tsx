import * as React from 'react';
import * as Immutable from 'immutable';

import { bindActionCreators } from 'redux';

import * as persistence from '../../data/persistence';
import * as models from '../../data/models';
import * as viewActions from '../../actions/view';
import * as courseActions from '../../actions/course';
import { AbstractEditorProps } from '../document/common/AbstractEditor';
import { AppServices } from '../common/AppServices';
import { PersistenceStrategy, 
  onSaveCompletedCallback, 
  onFailureCallback } from './persistence/PersistenceStrategy';
import { ListeningApproach } from './ListeningApproach';
import { lookUpByName } from './registry';
import { TitleOracle, MockTitleOracle } from '../common/TitleOracle';

interface EditorManager {

  componentDidUnmount: boolean;

  persistenceStrategy: PersistenceStrategy;

  onSaveCompleted: onSaveCompletedCallback;

  onSaveFailure: onFailureCallback;

  stopListening: boolean;

  _onEdit: (model : models.ContentModel) => void;


}

export interface EditorManagerProps {

  dispatch: any;

  documentId: string;

  userId: string;

  services: AppServices;

}

export interface EditorManagerState {
  editingAllowed: boolean;
  document: persistence.Document;
  editMode: boolean;
  activeSubEditorKey: string;
  courseId: string;
}

class EditorManager extends React.Component<EditorManagerProps, EditorManagerState> {

  constructor(props) {
    super(props);

    this.state = { 
      document: null, 
      editingAllowed: null, 
      editMode: true,
      activeSubEditorKey: null,
      courseId: '',
    };
    

    this.componentDidUnmount = false;
    this.persistenceStrategy = null; 
    this._onEdit = this.onEdit.bind(this);
    
    this.onSaveCompleted = (doc: persistence.Document) => {
  
      if (!this.componentDidUnmount) {
        this.setState({ document: doc });
      }
      
    };

    this.onSaveFailure = (reason : any) => {

    };
  }

  onEdit(model : models.ContentModel) {
    const doc = this.state.document.with({ model });
    this.setState({ document: doc }, () => this.persistenceStrategy.save(doc));
  }


  initPersistence(document: persistence.Document) {
      
    this.persistenceStrategy = lookUpByName(document.model.modelType).persistenceStrategy;
        
    this.persistenceStrategy.initialize(
      document, this.props.userId, 
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

  

  fetchDocument(documentId: string) {
    persistence.retrieveDocument(documentId)
      .then((document) => {
        
        // Notify that the course has changed when a user views a course
        if (document.model.modelType === models.ModelTypes.CourseModel) {
          this.props.dispatch(courseActions.courseChanged(documentId, 
            document.model.title.text,
            document.model.organizations.get(0),
            document.model.learningobjectives.get(0),
            document.model.skills.get(0)));
            
          // If we found out that we just loaded the course document, then save its Id
          // in the state  
          this.setState({ courseId: documentId });  
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
      .catch(err => console.log(err));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.documentId !== nextProps.documentId) {
      this.stopListening = true;
      this.setState({ document: null, editingAllowed: null });
      this.fetchDocument(nextProps.documentId);
    }
  }

  componentDidMount() {
    this.fetchDocument(this.props.documentId);
  }  

  componentWillUnmount() {
    this.stopListening = true;
    this.componentDidUnmount = true;
    if (this.persistenceStrategy !== null) {
      this.persistenceStrategy.destroy();
    }
  }

  listenForChanges() {
    persistence.listenToDocument(this.props.documentId)
      .then((document) => {
        if (!this.stopListening) {
          
          this.setState({ document });

          this.listenForChanges();
        }

      })
      .catch((err) => {
        if (!this.stopListening) {
          this.listenForChanges();
        }
      });
  }

  render() : JSX.Element {
    if (this.state.document === null || this.state.editingAllowed === null) {
      return null;
    } else {

        
      // I've moved the assignment of the courseId to the state, that way 
      // we know that after the course has been
      // loaded the courseId is always availble in the state and can 
      // be given to any subcomponent and be included
      // more easily in AppServices
          
      const childProps : AbstractEditorProps<any> = {
        model : this.state.document.model,
        context: { 
          documentId: this.props.documentId, 
          userId: this.props.userId,
          courseId: this.state.courseId,
        },
        onEdit: this._onEdit,
        services: this.props.services,
        editMode: this.state.editMode,
      };
      
      const registeredEditor = lookUpByName(this.state.document.model.modelType);
      const editor = React.createElement((registeredEditor.component as any), childProps);

      return <div>{editor}</div>;
    }
  }
  
}

export default EditorManager;
