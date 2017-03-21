'use strict'

import * as React from 'react';
import * as Immutable from 'immutable';

import * as persistence from '../../../data/persistence';
import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';
import * as types from '../../../data/types';
import { initWorkbook, resourceQuery, titlesForCoursesResources } from '../../../data/domain';
import * as viewActions from '../../../actions/view';

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
    this.fetchTitles(this.props.documentId);
  }

  fetchTitles(documentId: types.DocumentId) {
    persistence.queryDocuments(titlesForCoursesResources(documentId))
      .then(docs => {
        this.setState({
          resources: docs.map(d => ({ _id: d._id, title: (d as any).title.text, type: (d as any).modelType}))
        })
      });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.documentId !== nextProps.documentId) {
      this.fetchTitles(nextProps.documentId);
    }
  }

  clickResource(id) {
    this.props.services.viewDocument(id);
  }

  createResource() {

    const type = (this.refs['type'] as any).value;
    const title = (this.refs['title'] as any).value;

    let resource = null;
    if (type === 'workbook') {
      resource = new models.WorkbookPageModel({
          courseId: this.props.documentId,
          title: new contentTypes.TitleContent({ text: title})
        });
    } else {
      resource = new models.AssessmentModel({
          courseId: this.props.documentId,
          title: new contentTypes.TitleContent({ text: title})
        });
    }

    persistence.createDocument(resource)
      .then(result => this.fetchTitles(this.props.documentId));
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
        <select ref="type" className="form-select input-group-addon">
          <option value="workbook">Workbook</option>
          <option value="assessment">Assessment</option>
        </select>
        <input ref='title' type="text" className="form-input" placeholder="Title" />
        <button onClick={this.createResource.bind(this)} className="btn btn-primary input-group-btn">Create</button>
      </div>);
  }

  render() {
    return (
      <div className="container">
          <div className="row">
              <div className="col-1"></div>
              <div className="col-10">
                  <div>
                      {this.renderResources()}
                      {this.renderCreation()}
                  </div>
              </div>
              
              <div className="col-1"></div>
          </div>
      </div>
    )
  }

}

export default CourseEditor;
