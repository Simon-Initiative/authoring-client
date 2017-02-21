'use strict'

import * as React from 'react';

import * as persistence from '../../data/persistence';
import { document as documentActions } from '../../actions/document';

import { AbstractEditor, AbstractEditorProps, 
  AbstractEditorState } from '../AbstractEditor';

import { ImmediatePersistenceStrategy } from '../persistence/ImmediatePersistenceStrategy';

interface CourseEditor {
}

export interface WorkbookPageEditorProps extends AbstractEditorProps {
  editHistory: Object[];
  authoringActions: any;
  modalActions: any;
}

type CourseResource = {
  _id: string,
  title: string,
  type: string
}

interface WorkbookPageEditorState extends AbstractEditorState {
  resources: CourseResource[];
}

class CourseEditor extends AbstractEditor<ImmediatePersistenceStrategy, WorkbookPageEditorProps, WorkbookPageEditorState>  {

  constructor(props) {
    super(props, ImmediatePersistenceStrategy);
  }

  componentDidMount() {
    super.componentDidMount();

    // Fetch the titles of all current course resources
    let query = {
      selector: {
        '_id': {'$in': (this.props.document.content as any).resources},
      },
      fields: ['_id', 'content.title', 'metadata']
    }
    persistence.queryDocuments(query)
      .then(docs => this.setState({resources: 
        docs.map(d => ({ _id: d._id, title: (d.content as any).title, type: d.metadata.type}))}));
  }

  clickResource(id) {
    this.props.dispatch(documentActions.viewDocument(id));
  }

  createResource() {
    let resource = {
      metadata: {
        type: 'workbook',
        lockedBy: ''
      },
      content: {
        title: (this.refs['title'] as any).value
      }
    }
    persistence.createDocument(resource)
      .then(result => {

        // let addNewResource = (doc) => 
        // this.persistenceStrategy.save(addNewResource)
      });
  }

  renderResources() {

    let link = (id, title) => <button onClick={this.clickResource.bind(this, id)} className="btn btn-link">{title}</button>;

    let rows = this.state.resources.map(r => <tr>
                    <td>{r.type}</td>
                    <td>{link(r._id, r.title)}</td>
                    <td>Crime, Drama</td>
                    <td>14 October 1994</td>
                </tr>)

    return <table className="table table-striped table-hover">
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Title</th>
                </tr>
            </thead>
            <tbody>
                
            </tbody>
        </table>

  }

  renderCreation() {
    return <div className="input-group">
          <span className="input-group-addon">New workbook</span>
          <input ref='title' type="text" className="form-input" placeholder="Workbook page title" />
          <button onClick={this.createResource.bind(this)} className="btn btn-primary input-group-btn">Create</button>
      </div>
  }

  render() {
    return (
        <div className="container">
            <div className="columns">
                <div className="column col-1"></div>
                <div className="column col-10">
                    <div>
                        {this.renderResources()}
                        {this.renderCreation()}
                    </div>
                </div>
                
                <div className="column col-1"></div>
            </div>


        </div>
    )
  }

}

export default CourseEditor;
