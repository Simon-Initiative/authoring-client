'use strict'

import * as React from 'react';
import * as Immutable from 'immutable';

import * as persistence from '../../../data/persistence';
import * as models from '../../../data/models';
import * as types from '../../../data/types';
import { initWorkbook, resourceQuery } from '../../../data/domain';
import { document as documentActions } from '../../../actions/document';

import { AbstractEditor, AbstractEditorProps, 
  AbstractEditorState } from '../common/AbstractEditor';

interface CourseEditor {
  
}

export interface CourseEditorProps extends AbstractEditorProps<models.CourseModel> {
  
}

type CourseResource = {
  _id: string,
  title: string,
  type: string
}

interface CourseEditorState extends AbstractEditorState {
  resources: CourseResource[];
}

class CourseEditor extends AbstractEditor<models.CourseModel, CourseEditorProps, CourseEditorState>  {

  constructor(props) {
    super(props);

    this.state = { 
      resources: []
    };
  }

  componentDidMount() {
    // Fetch the titles of all current course resources
    this.fetchTitles(this.props.model.resources);
  }

  fetchTitles(resources: Immutable.List<types.DocumentId>) {
    persistence.queryDocuments(resourceQuery(resources.toArray()))
      .then(docs => {
        this.setState({
          resources: docs.map(d => ({ _id: d._id, title: (d as any).title.text, type: (d as any).modelType}))
        })
      });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.model.resources !== nextProps.model.resources) {
      this.fetchTitles(nextProps.model.resources);
    }
  }

  clickResource(id) {
    this.props.services.viewDocument(id);
  }

  createResource() {

    let resource = initWorkbook((this.refs['title'] as any).value);
      
    persistence.createDocument(resource)
      .then(result => {

        let addNewResource : models.ChangeRequest = (model: models.CourseModel) => {
          return model.with({
            resources: model.resources.push(result._id)
          })
        };
        
        this.props.onEdit(addNewResource);
      });
  }

  renderResources() {

    let link = (id, title) => 
      <button onClick={this.clickResource.bind(this, id)} 
        className="btn btn-link">{title}</button>;

    let rows = this.state.resources.map(r => 
      <tr key={r._id}>
          <td>{r.type}</td>
          <td>{link(r._id, r.title)}</td>
      </tr>)

    return (
      <table className="table table-striped table-hover">
        <thead>
            <tr>
                <th>Type</th>
                <th>Title</th>
            </tr>
        </thead>
        <tbody>
            {rows}
        </tbody>
      </table>);
  }

  renderCreation() {
    return (
      <div className="input-group">
        <span className="input-group-addon">New workbook</span>
        <input ref='title' type="text" className="form-input" placeholder="Workbook page title" />
        <button onClick={this.createResource.bind(this)} className="btn btn-primary input-group-btn">Create</button>
      </div>);
  }

  render() {
    console.log('rendered CourseEditor');
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
