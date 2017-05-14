import * as React from "react";

import {bindActionCreators} from "redux";

import * as persistence from "../../data/persistence";
import * as models from "../../data/models";
import * as courseActions from "../../actions/course";
import {AbstractEditorProps} from "../document/common/AbstractEditor";
import {AppServices} from "../common/AppServices";
import {onFailureCallback, onSaveCompletedCallback, PersistenceStrategy} from "./persistence/PersistenceStrategy";
import {ListeningApproach} from "./ListeningApproach";
import {lookUpByName} from "./registry";

interface EditorManager {

    componentDidUnmount: boolean;

    persistenceStrategy: PersistenceStrategy;

    onSaveCompleted: onSaveCompletedCallback;

    onSaveFailure: onFailureCallback;

    stopListening: boolean;

    _onEdit: (model: models.ContentModel) => void;


}

export interface EditorManagerProps {

    dispatch: any;

    documentId: string;

    userId: string;

    services: AppServices;

    course: any;

}

export interface EditorManagerState {
    editingAllowed: boolean;
    document: persistence.Document;
    editMode: boolean;
    activeSubEditorKey: string;
}

class EditorManager extends React.Component<EditorManagerProps, EditorManagerState> {

    constructor(props) {
        super(props);

        this.state = {
            document: null,
            editingAllowed: null,
            editMode: true,
            activeSubEditorKey: null
        };


        this.componentDidUnmount = false;
        this.persistenceStrategy = null;
        this._onEdit = this.onEdit.bind(this);

        this.onSaveCompleted = (doc: persistence.Document) => {

            if (!this.componentDidUnmount) {
                this.setState({document: doc});
            }

        };

        this.onSaveFailure = (reason: any) => {

        }
    }

    onEdit(model: models.ContentModel) {
        const doc = this.state.document.with({model: model});
        this.setState({document: doc}, () => this.persistenceStrategy.save(doc));
    }


    initPersistence(document: persistence.Document) {

        console.log("initPersistence (" + document.model.modelType + ")");

        this.persistenceStrategy = lookUpByName(document.model.modelType).persistenceStrategy;

        this.persistenceStrategy.initialize(
            document, this.props.userId,
            this.onSaveCompleted, this.onSaveFailure)
            .then(editingAllowed => {

                if (!this.componentDidUnmount) {
                    this.setState({editingAllowed});

                    const listeningApproach: ListeningApproach = lookUpByName(document.model.modelType).listeningApproach;

                    if ((!editingAllowed && listeningApproach === ListeningApproach.WhenReadOnly) ||
                        listeningApproach === ListeningApproach.Always) {

                        this.stopListening = false;
                        this.listenForChanges();
                    }
                }


            });
    }


    fetchDocument(courseId: string, documentId: string) {
        console.log("fetchDocument (" + documentId + ")");
        persistence.retrieveDocument(courseId, documentId)
            .then(document => {

                // Notify that the course has changed when a user views a course
                if (document.model.modelType === models.ModelTypes.CourseModel) {
                    this.props.dispatch(courseActions.courseChanged(document.model));
                }

                // Tear down previous persistence strategy
                if (this.persistenceStrategy !== null) {
                    this.persistenceStrategy.destroy()
                        .then(nothing => {
                            this.initPersistence(document)
                        });
                } else {
                    this.initPersistence(document);
                }

                this.setState({document})

            })
            .catch(err => console.log(err));
    }

    componentWillReceiveProps(nextProps) {
        console.log("componentWillReceiveProps (" + nextProps.documentId + ")");
        if (this.props.documentId !== nextProps.documentId) {
            this.stopListening = true;
            // Special processing if next document is a CourseModel - don't call fetchDocument
            if (nextProps.course && nextProps.course.model.guid === nextProps.documentId) {
                let document = new persistence.Document({
                    _id: nextProps.course.model.guid,
                    _rev: nextProps.course.model.rev,
                    model: nextProps.course.model
                });
                // Tear down previous persistence strategy
                if (this.persistenceStrategy !== null) {
                    this.persistenceStrategy.destroy()
                        .then(nothing => {
                            this.initPersistence(document)
                        });
                } else {
                    this.initPersistence(document);
                }
                this.setState({document})
            } else {
                this.setState({document: null, editingAllowed: null});
                if(nextProps.course) {
                    this.fetchDocument(nextProps.course.model.guid, nextProps.documentId);
                }
            }
        }
    }

    componentDidMount() {
        // Special handling for CourseModel  - don't call fetchDocument
        if (this.props.course && this.props.course.model.guid === this.props.documentId) {
            let document = new persistence.Document({
                _id: this.props.course.model.guid,
                _rev: this.props.course.model.rev,
                model: this.props.course.model
            });
            // Tear down previous persistence strategy
            if (this.persistenceStrategy !== null) {
                this.persistenceStrategy.destroy()
                    .then(nothing => {
                        this.initPersistence(document)
                    });
            } else {
                this.initPersistence(document);
            }
            this.setState({document})
        } else {
            if(this.props.course) {
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

    listenForChanges() {
        persistence.listenToDocument(this.props.documentId)
            .then(document => {
                if (!this.stopListening) {

                    this.setState({document});

                    this.listenForChanges();
                }

            })
            .catch(err => {
                if (!this.stopListening) {
                    this.listenForChanges();
                }
            })
    }

    render(): JSX.Element {
        if (this.state.document === null || this.state.editingAllowed === null) {
            return null;
        } else {

            let courseId = (this.state.document.model as any).courseId === undefined ? null : (this.state.document.model as any).courseId;

            const childProps: AbstractEditorProps<any> = {
                model: this.state.document.model,
                context: {
                    documentId: this.props.documentId,
                    userId: this.props.userId,
                    courseId: courseId
                },
                onEdit: this._onEdit,
                services: this.props.services,
                editMode: this.state.editMode
            }

            const registeredEditor = lookUpByName(this.state.document.model.modelType);
            const editor = React.createElement((registeredEditor.component as any), childProps);

            return <div>{editor}</div>;
        }
    }

}

export default EditorManager;
