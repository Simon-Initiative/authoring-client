'use strict'

import * as React from 'react';

import * as persistence from '../../data/persistence';
import { initWorkbook, resourceQuery } from '../../data/domain';
import { document as documentActions } from '../../actions/document';

import { AbstractEditor, AbstractEditorProps, 
  AbstractEditorState } from '../AbstractEditor';

import { ImmediatePersistenceStrategy } from '../persistence/ImmediatePersistenceStrategy';

interface CourseEditor {
  document: persistence.Document;
}

export interface CourseEditorProps extends AbstractEditorProps {
  editHistory: Object[];
  authoringActions: any;
  modalActions: any;
}

type CourseResource = {
  _id: string,
  title: string,
  type: string
}

interface CourseEditorState extends AbstractEditorState {
  resources: CourseResource[];
}

class CourseEditor extends AbstractEditor<ImmediatePersistenceStrategy, CourseEditorProps, CourseEditorState>  {

  constructor(props) {
    super(props, ImmediatePersistenceStrategy);

    this.document = this.props.document;

    this.state = { resources: [], editingAllowed: true};
  }

  componentDidMount() {
    // Fetch the titles of all current course resources
    persistence.queryDocuments(resourceQuery((this.props.document.content as any).resources))
      .then(docs => this.setState({resources: 
        docs.map(d => ({ _id: d._id, title: d.title, type: d.metadata.type}))}));
  }

  clickResource(id) {
    this.props.dispatch(documentActions.viewDocument(id));
  }

  createResource() {

    let resource = initWorkbook((this.refs['title'] as any).value);
      
    persistence.createDocument(resource)
      .then(result => {

        let addNewResource = (doc) => {
          let copy = persistence.copy(doc);
          (copy.content as any).resources.push(result.id);
          return copy;
        };
        this.persistenceStrategy.save(this.document, addNewResource)
      });
  }

  renderResources() {

    let link = (id, title) => <button onClick={this.clickResource.bind(this, id)} className="btn btn-link">{title}</button>;

    let rows = this.state.resources.map(r => <tr key={r._id}>
                    <td>{r.type}</td>
                    <td>{link(r._id, r.title)}</td>
                </tr>)

    return <table className="table table-striped table-hover">
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Title</th>
                </tr>
            </thead>
            <tbody>
                {rows}
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
