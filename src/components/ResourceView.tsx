import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import NavigationBar from './navigation/NavigationBar.controller';
import * as persistence from 'data/persistence';
import * as models from 'data/models';
import * as viewActions from 'actions/view';
import { compareDates, relativeToNow, adjustForSkew } from 'utils/date';
import { Resource } from 'data/content/resource';
import { courseChanged, getTitlesByModel, updateTitles, resetTitles } from 'actions/course';
import * as contentTypes from 'data/contentTypes';
import { SortableTable, DataRow, ColumnComparator, SortDirection } from './common/SortableTable';
import { isNullOrUndefined } from 'util';
import { TitlesState } from 'reducers/titles';
import guid from 'utils/guid';

import './ResourceView.scss';

export interface ResourceViewProps {
  course: any;
  dispatch: any;
  serverTimeSkewInMs: number;
  title: string;
  titles: TitlesState;
  resourceType: string;
  filterFn: (resource: Resource) => boolean;
  createResourceFn: (
    courseId: string,
    title: string, type: string) => models.ContentModel;
}

interface ResourceViewState {
  resources: Resource[];
}

export default class ResourceView extends React.Component<ResourceViewProps, ResourceViewState> {
  viewActions: any;

  constructor(props) {
    super(props);

    this.state = {
      resources: [],
    };

    this.viewActions = bindActionCreators((viewActions as any), this.props.dispatch);
  }

  componentDidMount() {
    const { course, dispatch } = this.props;

    // Fetch all current course resources
    this.fetchTitles(this.props.course.model, this.props.filterFn);

    // intiialize titles state for the course
    dispatch(getTitlesByModel(course.model));
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
    this.setState({ resources });
  }

  componentWillReceiveProps(nextProps) {
    this.fetchTitles(nextProps.course.model, nextProps.filterFn);
  }

  clickResource(id) {
    viewActions.viewDocument(id, this.props.course.model.guid);
  }

  createResource(e) {
    const { dispatch } = this.props;

    e.preventDefault();
    const title = (this.refs['title'] as any).value;
    if (isNullOrUndefined(title) || title === '') {
      return;
    }
    const type = this.props.resourceType;
    const resource = this.props.createResourceFn(
      this.props.course.model.guid, title, type);

    (this.refs['title'] as any).value = '';

    persistence.createDocument(this.props.course.model.guid, resource)
      .then((result) => {
        dispatch(updateTitles([{ id: result.getIn(['model', 'id']), title }]));
        this.refreshCoursePackage(this.props.course.model.guid);
      });
  }

  refreshCoursePackage(courseId: string) {
    persistence.retrieveCoursePackage(courseId)
      .then((document) => {
        // Get an updated course content package payload
        if (document.model.modelType === models.ModelTypes.CourseModel) {
          this.props.dispatch(courseChanged(document.model));
        }
      })
      .catch(err => console.log(err));
  }

  renderResources() {
    const { titles } = this.props;

    const creationTitle = <h2>{this.props.title}</h2>;

    const link = resource =>
      <button onClick={this.clickResource.bind(this, resource.guid)}
              className="btn btn-link">{resource.title}</button>;

    const rows = this.state.resources.map(r => ({
      key: r.guid,
      data: r.set('title', titles.get(r.get('id'))),
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
      <div className="table-toolbar input-group">
        <div className="flex-spacer"/>
        <form className="form-inline">
          <input type="text" ref="title"
                 className="form-control mb-2 mr-sm-2 mb-sm-0" id="inlineFormInput"
                 placeholder="New Title"></input>
          <button onClick={this.createResource.bind(this)}
                  className="btn btn-primary">Create
          </button>
        </form>
      </div>
    );
  }

  render() {

    return (
      <div className="resource-view container-fluid new">
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
