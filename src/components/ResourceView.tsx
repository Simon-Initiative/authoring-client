'use strict'

import * as React from 'react';
import * as Immutable from 'immutable';
import { bindActionCreators } from 'redux';
import { CourseResource, fetchCourseResources } from '../editors/document/common/resources';
import NavigationBar from './NavigationBar';
import * as persistence from '../data/persistence';
import * as models from '../data/models';
import * as contentTypes from '../data/contentTypes';
import * as types from '../data/types';
import * as viewActions from '../actions/view';


interface ResourceView {
  viewActions: any;
}

export interface ResourceViewProps {
  courseId: string;
  dispatch: any;
  title: string;
  filterFn: (resource: CourseResource) => boolean;
  createResourceFn: (title: string, courseId: string) => models.ContentModel;
}



interface ResourceViewState {
  resources: CourseResource[];
}

class ResourceView extends React.Component<ResourceViewProps, ResourceViewState>  {

  constructor(props) {
    super(props);

    this.state = {
      resources: []
    };

    this.viewActions = bindActionCreators((viewActions as any), this.props.dispatch);
  }

  componentDidMount() {
    // Fetch the titles of all current course resources
    this.fetchTitles(this.props.courseId);
  }

  fetchTitles(id: string) {
    fetchCourseResources(id)
      .then(resources => {
        this.setState({resources: resources.filter(this.props.filterFn)});
      });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.courseId !== nextProps.courseId || this.props.title !== nextProps.title) {
      this.fetchTitles(nextProps.courseId);
    }
  }

  clickResource(id) {
    this.props.dispatch(viewActions.viewDocument(id));
  }

  createResource(e) {

    e.preventDefault();

    const title = (this.refs['title'] as any).value;
    const resource = this.props.createResourceFn(title, this.props.courseId);
    
    persistence.createDocument(resource)
      .then(result => this.fetchTitles(this.props.courseId));
  }

  renderResources() {

    let link = (id, title) => 
      <button onClick={this.clickResource.bind(this, id)} 
        className="btn btn-link">{title}</button>;

    let rows = this.state.resources.map(r => 
      <tr key={r._id}>
          <td>{link(r._id, r.title)}</td>
      </tr>)

    return (
      <div className="">
        <h2>{this.props.title}</h2>
        <table className="table table-striped table-hover">
          <thead>
              <tr>
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
          <input type="text" ref='title' className="form-control mb-2 mr-sm-2 mb-sm-0" id="inlineFormInput" placeholder="Title"></input>
          <button onClick={this.createResource.bind(this)} className="btn btn-primary">Create</button>
        </form>
      </div>);
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
            <NavigationBar viewActions={this.viewActions} />
            <div className="col-sm-9 offset-sm-3 col-md-10 offset-md-2 document">
              <div className="container-fluid editor">
                <div className="row">
                  <div className="col-12">
                    {this.renderResources()}
                    {this.renderCreation()}
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    ); 
  }

}

export default ResourceView;
