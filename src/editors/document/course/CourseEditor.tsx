'use strict'

import * as React from 'react';
import * as Immutable from 'immutable';
import { CourseResource, fetchCourseResources } from '../common/resources';
import * as persistence from '../../../data/persistence';
import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';
import * as types from '../../../data/types';
import * as viewActions from '../../../actions/view';

import { AbstractEditor, AbstractEditorProps, 
  AbstractEditorState } from '../common/AbstractEditor';

interface CourseEditor {
  
}

export interface CourseEditorProps extends AbstractEditorProps<models.CourseModel> {
  
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

  fetchTitles(id: string) {
    fetchCourseResources(id)
      .then(resources => this.setState({resources}));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.documentId !== nextProps.documentId) {
      this.fetchTitles(nextProps.documentId);
    }
  }

  clickResource(id) {
    this.props.services.viewDocument(id);
  }

  createResource(e) {

    e.preventDefault();

    const type = (this.refs['type'] as any).value;
    const title = (this.refs['title'] as any).value;

    let resource = null;
    if (type === 'workbook') {
      resource = new models.WorkbookPageModel({
          courseId: this.props.documentId,
          head: new contentTypes.Head({ title: new contentTypes.Title({ text: title}) })
        });
    } else {
      resource = new models.AssessmentModel({
          courseId: this.props.documentId,
          title: new contentTypes.Title({ text: title})
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
      <div className="col-12">
        <h2>Pages</h2>
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
        </table>
      </div>);
  }

  renderCreation() {
    return (
      <div className="input-group col-12">
        <form className="form-inline">
          <select ref="type" className="custom-select mb-2 mr-sm-2 mb-sm-0" id="inlineFormCustomSelect">
            <option value="workbook">Workbook</option>
            <option value="assessment">Assessment</option>
          </select>
          <input type="text" ref='title' className="form-control mb-2 mr-sm-2 mb-sm-0" id="inlineFormInput" placeholder="Title"></input>
          <button onClick={this.createResource.bind(this)} className="btn btn-primary">Create</button>
        </form>
      </div>);
  }

  render() {
    return (
      <div className="container-fluid editor">
          <div className="row">
              { /* <div className="col-1"></div> */}
              
              {this.renderResources()}
              {this.renderCreation()}
              
              { /* <div className="col-1"></div> */}
          </div>
      </div>
    )
  }

}

export default CourseEditor;
