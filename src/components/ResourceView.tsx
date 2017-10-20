import * as React from 'react';
import { returnType } from '../utils/types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import NavigationBar from './NavigationBar';
import * as persistence from '../data/persistence';
import * as models from '../data/models';
import * as viewActions from '../actions/view';
import { compareDates, relativeToNow, adjustForSkew } from '../utils/date';
import { Resource } from '../data/content/resource';
import * as courseActions from '../actions/course';
import * as contentTypes from '../data/contentTypes';
import { SortableTable, DataRow, ColumnComparator, SortDirection } from './common/SortableTable';
import { isNullOrUndefined } from 'util';
import guid from '../utils/guid';

interface ResourceView {
  viewActions: any;
}
export interface ResourceViewOwnProps {
  // course: any;
  dispatch: any;
  serverTimeSkewInMs: number;
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
    const resources = model.resources.toArray()
      .filter(filterFn)
      .map((res) => {
        if (res.title === null) {
          return res.with({ title: 'Empty title' });
        }
        return res;
      });
    console.log('set state with resources');
    this.setState({ resources });
  }

  componentWillReceiveProps(nextProps) {
    this.fetchTitles(nextProps.course.model, nextProps.filterFn);
  }

  clickResource(id) {
    viewActions.viewDocument(id, this.props.course.model.guid);
  }

  createResource(e) {
    e.preventDefault();
    const title = (this.refs['title'] as any).value;
    if (isNullOrUndefined(title) || title === '') {
      return;
    }
    const type = this.props.resourceType;
    const resource = this.props.createResourceFn(title, type);

    (this.refs['title'] as any).value = '';

    persistence.createDocument(this.props.course.model.guid, resource)
      .then(result => this.refreshCoursePackage(this.props.course.model.guid));
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

    const creationTitle = <h2>{this.props.title}</h2>;

    const link = resource =>
      <button onClick={this.clickResource.bind(this, resource.guid)}
              className="btn btn-link">{resource.title}</button>;

    const rows = this.state.resources.map(r => ({ 
      key: r.guid,
      data: r,
    }));

    const labels = [
      'Title',
      'Created',
      'Last Updated',
    ];

    const comparators = [
      (direction, a, b) => direction === SortDirection.Ascending 
        ? a.title.localeCompare(b.title) 
        : b.title.localeCompare(a.title),
      (direction, a, b) => direction === SortDirection.Ascending 
        ? compareDates(a.dateCreated, b.dateCreated) 
        : compareDates(b.dateCreated, a.dateCreated),
      (direction, a, b) => direction === SortDirection.Ascending 
        ? compareDates(a.dateUpdated, b.dateUpdated)  
        : compareDates(b.dateUpdated, a.dateUpdated),
    ];

    const renderers = [
      r => link(r),
      r => <span>{relativeToNow(
        adjustForSkew(r.dateCreated, this.props.serverTimeSkewInMs))}</span>,
      r => <span>{relativeToNow(
        adjustForSkew(r.dateUpdated, this.props.serverTimeSkewInMs))}</span>,
    ];

    return (
      <div className="">
        {creationTitle}
        {this.renderCreation()}
        <SortableTable 
          model={rows}
          columnComparators={comparators}
          columnRenderers={renderers}
          columnLabels={labels}/>
      </div>
    );
  }

  renderCreation() {
    return (
      <div className="input-group col-4 float-right">
        <form className="form-inline">
          <input type="text" ref="title"
                 className="form-control mb-2 mr-sm-2 mb-sm-0" id="inlineFormInput"
                 placeholder="Title"></input>
          <button onClick={this.createResource.bind(this)}
                  className="btn btn-primary">Create
          </button>
        </form>
      </div>);
  }

  render() {
    console.log('render');
    return (
      <div className="container-fluid new">
        <div className="row">
          <NavigationBar viewActions={this.viewActions}/>
          <div className="col-sm-9 col-md-10 document">
            <div className="container-fluid editor">
              <div className="row">
                <div className="col-12">
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
