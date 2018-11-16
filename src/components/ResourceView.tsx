import { updateCourseResources } from 'actions/course';
import * as viewActions from 'actions/view';
import { Resource } from 'data/content/resource';
import * as models from 'data/models';
import * as persistence from 'data/persistence';
import * as Immutable from 'immutable';
import * as React from 'react';
import { isNullOrUndefined } from 'util';
import { adjustForSkew, compareDates, relativeToNow } from 'utils/date';
import { LogAttribute, LogLevel, LogStyle, LogTag, logger } from 'utils/logger';
import './ResourceView.scss';
import { SortDirection, SortableTable } from './common/SortableTable';
import SearchBar from 'components/common/SearchBar';
import { highlightMatches } from 'components/common/SearchBarLogic';
import { LegacyTypes } from 'data/types';

export interface ResourceViewProps {
  course: models.CourseModel;
  dispatch: any;
  serverTimeSkewInMs: number;
  title: string;
  resourceType: LegacyTypes;
  filterFn: (resource: Resource) => boolean;
  createResourceFn: (
    courseId: string,
    title: string, type: string) => models.ContentModel;
  helpPopover?: JSX.Element;
}

interface ResourceViewState {
  selected: Resource;
  searchText: string;
  resources: Resource[];
}

export default class ResourceView extends React.Component<ResourceViewProps, ResourceViewState> {
  viewActions: any;

  constructor(props) {
    super(props);

    this.state = {
      selected: undefined,
      searchText: '',
      resources: this.getFilteredRows(props),
    };
  }

  componentWillReceiveProps(nextProps: ResourceViewProps): void {
    if (nextProps.resourceType !== this.props.resourceType &&
      nextProps.title !== this.props.title) {
      this.setState({
        resources: this.getFilteredRows(nextProps),
      });
    }
  }

  componentDidMount() {
    this.logResourceDetails(this.state.resources);
  }

  getFilteredRows(props: ResourceViewProps): Resource[] {
    return props.course.resources
      .toArray()
      .filter(props.filterFn);
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

        // update component state and keep current search
        this.filterBySearchText(this.state.searchText);
      });
  }

  // Filter resources shown based on title and id
  filterBySearchText(searchText: string): void {
    const text = searchText.trim().toLowerCase();
    const filterFn = (r: Resource): boolean => {
      const { title, id } = r;
      const titleLower = title ? title.toLowerCase() : '';
      const idLower = id ? id.toLowerCase() : '';

      return text === '' ||
        titleLower.indexOf(text) > -1 ||
        idLower.indexOf(text) > -1;
    };

    // searchText state is used for highlighting matches, and resources state creates
    // one row in the table for each resource present
    this.setState({
      searchText,
      resources: this.getFilteredRows(this.props).filter(filterFn),
    });
  }

  renderResources() {
    const creationTitle = <h2>{this.props.title}  {this.props.helpPopover}</h2>;
    const rows = this.state.resources.map(r => ({ key: r.guid, data: r }));

    const labels = [
      'Title',
      'Unique ID',
      'Created',
      'Last Updated',
    ];

    const comparators = [
      (direction, a, b) => safeCompare('title', 'id', direction, a, b),
      (direction, a, b) => safeCompare('id', 'title', direction, a, b),
      (direction, a, b) => direction === SortDirection.Ascending
        ? compareDates(a.dateCreated, b.dateCreated)
        : compareDates(b.dateCreated, a.dateCreated),
      (direction, a, b) => direction === SortDirection.Ascending
        ? compareDates(a.dateUpdated, b.dateUpdated)
        : compareDates(b.dateUpdated, a.dateUpdated),
    ];

    const highlightedColumnRenderer = (prop: string, r: Resource) =>
      this.state.searchText.length < 3
        ? <span>{r[prop]}</span>
        : highlightMatches(prop, r, this.state.searchText);

    const link = resource => span =>
      <button onClick={this.clickResource.bind(this, resource.guid)}
        className="btn btn-link">{span}</button>;

    const columnRenderers = [
      r => link(r)(highlightedColumnRenderer('title', r)),
      r => highlightedColumnRenderer('id', r),
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
          columnRenderers={columnRenderers}
          columnLabels={labels} />
      </div>
    );
  }

  renderCreation() {
    const { course } = this.props;

    return (
      <div className="table-toolbar">
        <SearchBar
          className="inlineSearch"
          placeholder="Search by Title or Unique ID"
          onChange={searchText => this.filterBySearchText(searchText)}
        />
        <div className="input-group">
          <div className="flex-spacer" />
          <form className="form-inline">
            <input type="text" ref="title"
              disabled={!course.editable}
              className="form-control mb-2 mr-sm-2 mb-sm-0" id="inlineFormInput"
              placeholder="New Title"></input>
            <button onClick={this.createResource.bind(this)}
              disabled={!course.editable}
              className="btn btn-primary">Create
          </button>
          </form>
        </div>
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

export function safeCompare(primaryK: string, secondaryK: string, direction: SortDirection, a, b) {

  if (a[primaryK] === null && b[primaryK] === null) {
    return 0;
  }
  if (a[primaryK] === null) {
    return direction === SortDirection.Ascending ? 1 : -1;
  }
  if (b[primaryK] === null) {
    return direction === SortDirection.Ascending ? -1 : 1;
  }
  if (a[primaryK] === b[primaryK]) {
    if (a[secondaryK] === b[secondaryK]) {
      return 0;
    }
    return safeCompare(secondaryK, primaryK, direction, a, b);
  }
  return direction === SortDirection.Ascending
    ? a[primaryK].localeCompare(b[primaryK])
    : b[primaryK].localeCompare(a[primaryK]);
}
