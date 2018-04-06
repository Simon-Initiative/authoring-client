import * as React from 'react';
import * as Immutable from 'immutable';
import * as persistence from 'data/persistence';
import * as models from 'data/models';
import * as viewActions from 'actions/view';
import { adjustForSkew, compareDates, relativeToNow } from 'utils/date';
import { Resource } from 'data/content/resource';
import { updateCourseResources } from 'actions/course';
import { SortableTable, SortDirection } from './common/SortableTable';
import { isNullOrUndefined } from 'util';
import { logger, LogTag, LogLevel, LogAttribute, LogStyle } from 'utils/logger';

import './ResourceView.scss';

export interface ResourceViewProps {
  course: models.CourseModel;
  dispatch: any;
  serverTimeSkewInMs: number;
  title: string;
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
  }

  logResourceDetails(resources: Resource[]) {
    logger.group(
      LogLevel.INFO,
      LogTag.DEFAULT,
      `Resource Details:`,
      (logger) => {
        resources.forEach((resource) => {
          logger
          .setVisibility(LogAttribute.TAG, false)
          .setVisibility(LogAttribute.DATE, false)
          .info(LogTag.DEFAULT, `${resource.title} (id: ${resource.id})`)
          .groupCollapsed(
            LogLevel.INFO,
            LogTag.DEFAULT,
            'Details',
            (logger) => {
              logger
                .setVisibility(LogAttribute.TAG, false)
                .setVisibility(LogAttribute.DATE, false)
                .info(LogTag.DEFAULT, `Type: ${resource.type}`)
                .info(LogTag.DEFAULT, `FilePath: ${resource
                  .fileNode
                  .pathTo
                  .replace(/\.json/, '.xml')}`);
            });
        });
      },
      LogStyle.HEADER + LogStyle.BLUE,
    );
  }

  clickResource(id) {
    this.props.dispatch(viewActions.viewDocument(id, this.props.course.guid));
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
      this.props.course.guid, title, type);

    (this.refs['title'] as any).value = '';

    persistence.createDocument(this.props.course.guid, resource)
      .then((result) => {
        const r = (result as any).model.resource;

        const updated = Immutable.OrderedMap<string, Resource>([[r.guid, r]]);
        dispatch(updateCourseResources(updated));
      });
  }

  renderResources() {
    const { course } = this.props;

    const creationTitle = <h2>{this.props.title}</h2>;

    const link = resource =>
      <button onClick={this.clickResource.bind(this, resource.guid)}
              className="btn btn-link">{resource.title}</button>;

    const rows = course.resources
      .toArray()
      .filter(this.props.filterFn)
      .map(r => ({
        key: r.guid,
        data: course.resources.has(r.guid) ? course.resources.get(r.guid) : { title: 'Loading...' },
      }));

    const resources = rows.map(row => row.data as Resource);
    this.logResourceDetails(resources);

    const labels = [
      'Title',
      'Unique ID',
      'Created',
      'Last Updated',
    ];

    const safeCompare = (direction, a, b) => {
      if (a.title === null && b.title === null) {
        return 0;
      }
      if (a.title === null) {
        return direction === SortDirection.Ascending ? 1 : -1;
      }
      if (b.title === null) {
        return direction === SortDirection.Ascending ? -1 : 1;
      }
      return direction === SortDirection.Ascending
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    };

    const comparators = [
      safeCompare,
      // Add compariator for unique ID
      (direction, a, b) => direction === SortDirection.Ascending
        ? compareDates(a.dateCreated, b.dateCreated)
        : compareDates(b.dateCreated, a.dateCreated),
      (direction, a, b) => direction === SortDirection.Ascending
        ? compareDates(a.dateUpdated, b.dateUpdated)
        : compareDates(b.dateUpdated, a.dateUpdated),
    ];

    const renderers = [
      r => link(r),
      r => <span>{r.id}</span>,
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
          <div className="col-sm-12 col-md-12 document">
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
