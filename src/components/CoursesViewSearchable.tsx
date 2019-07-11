import * as React from 'react';
import * as Immutable from 'immutable';
import * as persistence from 'data/persistence';
import * as Messages from 'types/messages';
import { Maybe } from 'tsmonad';
import { buildFeedbackFromCurrent } from 'utils/feedback';
import { SortDirection, SortableTable } from './common/SortableTable';
import SearchBar from 'components/common/SearchBar';
import './CoursesViewSearchable.scss';
import { LoadingSpinner, LoadingSpinnerSize } from 'components/common/LoadingSpinner';
import { highlightMatchesStr } from 'components/common/SearchBarLogic';
import { adjustForSkew, compareDates, relativeToNow } from 'utils/date';
import { safeCompare } from 'components/ResourceView';
import { buildGeneralErrorMessage } from 'utils/error';
import { CourseIdVers, CourseGuid, CourseId } from 'data/types';

function reportProblemAction(): Messages.MessageAction {

  const url = buildFeedbackFromCurrent('', '');

  return {
    label: 'Report Problem',
    enabled: true,
    execute: () => window.open(url, 'ReportProblemTab'),
  };
}

function errorMessageAction(): Messages.Message {

  const content = new Messages.TitledContent().with({
    title: 'Error contacting server',
    message: 'Try reloading the page. If the problem persists, please contact support.',
  });

  return new Messages.Message().with({
    content,
    actions: Immutable.List([reportProblemAction(), Messages.RELOAD_ACTION]),
    severity: Messages.Severity.Error,
    scope: Messages.Scope.Application,
  });
}

export type CourseDescription = {
  guid: CourseGuid,
  id: string,
  version: string,
  idvers: CourseIdVers,
  title: string,
  description: string,
  buildStatus: string,
  dateCreated: Date,
};

export type CoursesViewProps = {
  serverTimeSkewInMs: number,
  userId: string,
  createCourse: () => any,
  importCourse: () => any,
  onSelect: (id: CourseIdVers) => any, // the id of the course to be viewed
  sendMessage: (msg: Messages.Message) => any;
};

export type CoursesViewState = {
  courses: Maybe<CourseDescription[]>,
  searchText: string,
};

class CoursesViewSearchable extends React.PureComponent<CoursesViewProps, CoursesViewState> {

  constructor(props) {
    super(props);

    this.state = {
      courses: Maybe.nothing<CourseDescription[]>(),
      searchText: '',
    };
  }

  // called to update state when search text changes
  textChange = (searchText: string) => this.setState({
    searchText,
    courses: this.state.courses,
  })

  // filter table based on titles, ids, and versions
  filterCourses(): CourseDescription[] {
    const searchText = this.state.searchText;
    const text = searchText.trim().toLowerCase();
    const filterFn = (r: CourseDescription): boolean => {
      const { title, id, version } = r;
      const titleLower = title ? title.toLowerCase() : '';
      const idLower = id ? id.toLowerCase() : '';
      const versionLower = version ? version.toLowerCase() : '';

      return text === '' ||
        titleLower.indexOf(text) > -1 ||
        idLower.indexOf(text) > -1 || versionLower.indexOf(text) > -1;
    };

    return this.state.courses.caseOf({
      just: courses => courses.filter(filterFn),
      nothing: () => [],
    });
  }

  componentDidMount() {
    persistence.getEditablePackages()
      .then((docs) => {
        const courses: CourseDescription[] = docs.map(d => ({
          guid: d.guid,
          id: d.id,
          version: d.version,
          idvers: d.idvers,
          title: d.title,
          dateCreated: d.dateCreated,
          description: d.description,
          buildStatus: d.buildStatus,
        }));
        this.setState({
          courses: Maybe.just(courses),
          searchText: this.state.searchText,
        });
      })
      .catch((err) => {
        this.props.sendMessage(buildGeneralErrorMessage(err.message));
      });
  }

  render() {
    return (
      <div className="courses-view">
        <div className="my-course-packages">
          <h2 style={{ display: 'inline' }}>My Courses</h2>
          {
            this.state.courses.caseOf({
              just: courses => courses.length === 0 ?
                <NoCourses
                  createCourse={this.props.createCourse}
                  importCourse={this.props.importCourse}
                /> :
                <CoursesViewSearchableTable
                  searchText={this.state.searchText}
                  textChange={this.textChange}
                  serverTimeSkewInMs={this.props.serverTimeSkewInMs}
                  createCourse={this.props.createCourse}
                  importCourse={this.props.importCourse}
                  rows={this.filterCourses()}
                  onSelect={this.props.onSelect}
                />,
              nothing: () => <Waiting />,
            })
          }
        </div>
      </div>
    );
  }
}

const Waiting = (): JSX.Element => {
  return (
    <div className="lead" style={{ width: '175px' }} >
      <LoadingSpinner size={LoadingSpinnerSize.Small} message="Loading courses..." />
    </div>
  );
};

const CreateImport = ({ createCourse, importCourse }): JSX.Element => {
  return (<div className="input-group">
    <div className="flex-spacer" />
    <form className="form-inline">
      <div style={{ display: 'inline', float: 'right' }}>
        <button
          type="button" className="btn btn-primary" key="createNew"
          onClick={createCourse}>
          <b>Create new</b>
        </button>
        &nbsp;&nbsp;
        <button
          type="button" className="btn btn-primary" key="import"
          onClick={importCourse}>
          <b>Import existing</b>
        </button>
      </div>
    </form>
  </div>);
};

const NoCourses = ({ createCourse, importCourse }): JSX.Element => {
  return (
    <div>
      <CreateImport createCourse={createCourse} importCourse={importCourse} />
      <div>
        <p className="lead">
          <b>You have no course packages available.</b>
        </p>
        Try:
      <ul>
          <li>Creating a new course package</li>
          <li>Importing an existing OLI course package directly from a Subversion repository</li>
          <li>Contacting another user to have them grant you access to their course package</li>
        </ul>
      </div>
    </div>
  );
};

const TableToolbar = ({ textChange, createCourse, importCourse }): JSX.Element => {
  return (
    <div className="table-toolbar">
      <SearchBar
        className="inlineSearch"
        placeholder="Search by Title, Version or Unique ID"
        onChange={textChange}
      />
      <CreateImport createCourse={createCourse} importCourse={importCourse} />
    </div>
  );
};
interface CoursesViewSearchableTableProps {
  rows: CourseDescription[];
  onSelect: (id: CourseIdVers) => void;
  searchText: string;
  serverTimeSkewInMs: number;
  textChange: (s: string) => void;
  createCourse: () => void;
  importCourse: () => void;
}
const CoursesViewSearchableTable = ({ rows, onSelect, searchText, serverTimeSkewInMs,
  textChange, createCourse, importCourse }: CoursesViewSearchableTableProps): JSX.Element => {

  const labels = [
    'Title',
    'Version',
    'Unique ID',
    'Created',
  ];

  const link = course => span =>
    <button disabled={course.buildStatus !== 'READY'}
      onClick={() => onSelect(course.idvers)}
      className="btn btn-link">{span}</button>;

  const columnRenderers = [
    r => link(r)(highlightedColumnRenderer(
      'title', r, r.buildStatus === 'READY' ? '' : ' (processing)')),
    r => highlightedColumnRenderer('version', r),
    r => highlightedColumnRenderer('id', r),
    r => <span>{relativeToNow(
      adjustForSkew(r.dateCreated, serverTimeSkewInMs))}</span>,
  ];

  const highlightedColumnRenderer = (
    prop: string,
    r: CourseDescription, appendText: string = '') =>
    searchText.length < 3
      ? <span>{r[prop] + appendText}</span>
      : highlightMatchesStr(r[prop] + appendText, searchText);

  const comparators = [
    (direction, a, b) => safeCompare('title', 'id', direction, a, b),
    (direction, a, b) => safeCompare('id', 'title', direction, a, b),
    (direction, a, b) => safeCompare('version', 'title', direction, a, b),
    (direction, a, b) => direction === SortDirection.Ascending
      ? compareDates(a.dateCreated, b.dateCreated)
      : compareDates(b.dateCreated, a.dateCreated),
  ];

  return (
    <div className="resource-view new">
      <div className="document">
        <div className="editor">
          <TableToolbar
            importCourse={importCourse}
            textChange={textChange}
            createCourse={createCourse} />
          <SortableTable
            model={rows.map(r => ({ key: r.guid.value(), data: r }))}
            columnComparators={comparators}
            columnRenderers={columnRenderers}
            columnLabels={labels} />
        </div>
      </div>
    </div>
  );
};

export default CoursesViewSearchable;
