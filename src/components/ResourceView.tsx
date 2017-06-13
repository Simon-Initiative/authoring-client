import * as React from 'react';
import { returnType } from '../utils/types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import NavigationBar from './NavigationBar';
import * as persistence from '../data/persistence';
import * as models from '../data/models';
import * as viewActions from '../actions/view';
import { Resource } from '../data/resource';
import * as courseActions from '../actions/course';
import { isNullOrUndefined } from 'util';

interface ResourceView {
  viewActions: any;
}

export interface ResourceViewOwnProps {
  courseId: string;
  dispatch: any;
  title: string;
  resourceType: string;
  filterFn: (resource: Resource) => boolean;
  createResourceFn: (title: string, courseId: string) => models.ContentModel;
}


interface ResourceViewState {
  resources: Resource[];
}

function mapStateToProps(state: any) {

  const {
    course,
  } = state;

  return {
    course,
  };
}

const stateGeneric = returnType(mapStateToProps);
type ResourceViewReduxProps = typeof stateGeneric;
type ResourceViewProps = ResourceViewReduxProps & ResourceViewOwnProps & { dispatch };

class ResourceView extends React.Component<ResourceViewProps, ResourceViewState> {

  constructor(props) {
    super(props);

    this.state = {
      resources: [],
    };

    this.viewActions = bindActionCreators((viewActions as any), this.props.dispatch);
  }

  componentDidMount() {
    // Fetch the titles of all current course resources
    this.fetchTitles(this.props.course.model, this.props.filterFn);
  }

  fetchTitles(model: models.CourseModel, filterFn: any) {
    const resources = model.resources.toArray().filter(filterFn);
    console.log('resources length: ' + resources.length);
    this.setState({ resources });
  }

  componentWillReceiveProps(nextProps) {
    console.log('received new props');
    this.fetchTitles(nextProps.course.model, nextProps.filterFn);
  }

  clickResource(id) {
    viewActions.viewDocument(id);
  }

  createResource(e) {
    e.preventDefault();
    const title = (this.refs['title'] as any).value;
    let type = this.props.resourceType;
    if (this.props.resourceType === 'x-oli-assessment') {
      type = 'x-oli-inline-assessment';
    }
    const resource = this.props.createResourceFn(title, type);

    persistence.createDocument(this.props.courseId, resource)
      .then(result => this.refreshCoursePackage(this.props.courseId));
  }

  refreshCoursePackage(courseId: string) {
    persistence.retrieveCoursePackage(courseId)
      .then((document) => {
        // Get an updated course content package payload
        if (document.model.modelType === models.ModelTypes.CourseModel) {
          this.props.dispatch(courseActions.courseChanged(document.model));
        }
      })
      .catch(err => console.log(err));
  }

  renderResources() {

    let creationTitle=<h2>{this.props.title}</h2>;

    // This is temporary patch. For some of the document titles we
    // need to translate and map to a more appropriate title.  
    if (this.props.title=="Skills") {
      creationTitle=<h2>Available Skill Models</h2>;
    }
      
    // This is temporary patch. For some of the document titles we
    // need to translate and map to a more appropriate title.      
    if (this.props.title=="Learning Objectives") {
      creationTitle=<h2>Available Learning Objective Models</h2>;
    }      
      
    const link = (id, title) =>
      <button onClick={this.clickResource.bind(this, id)}
              className="btn btn-link">{title}</button>;

    const rows = this.state.resources.map(r =>
      <tr key={r.guid}>
        <td>{link(r.guid, r.title)}</td>
        <td>{r.id}</td>
        <td>{r.type}</td>
      </tr>);

    return (
      <div className="">
        {creationTitle}
        <table className="table table-striped table-hover">
          <thead>
          <tr>
            <th>Title</th>
            <th>Id</th>
            <th>Type</th>
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
          <input type="text" ref="title"
            className="form-control mb-2 mr-sm-2 mb-sm-0" id="inlineFormInput"
            placeholder="Title"></input>
          <button onClick={this.createResource.bind(this)} 
            className="btn btn-primary">Create</button>
        </form>
      </div>);
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <NavigationBar viewActions={this.viewActions}/>
          <div className="col-sm-9 offset-sm-3 col-md-10 offset-md-2 document">
            <div className="container-fluid editor">
              <div className="row">
                <div className="col-12">
                  {this.renderCreation()}
                  {this.renderResources()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

export default connect<ResourceViewReduxProps, {}, ResourceViewOwnProps>
  (mapStateToProps)(ResourceView);
