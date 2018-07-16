import * as React from 'react';
import * as Immutable from 'immutable';
import * as persistence from 'data/persistence';
import * as viewActions from 'actions/view';
import * as messageActions from 'actions/messages';
import * as Messages from 'types/messages';
import { Maybe } from 'tsmonad';
import { buildFeedbackFromCurrent } from 'utils/feedback';
import { SortDirection, SortableTable } from './common/SortableTable';
import SearchBar from 'components/common/SearchBar';
import './CoursesViewSearchable.scss';
import { LoadingSpinner } from 'components/common/LoadingSpinner';
import { highlightMatches } from 'components/common/SearchBarLogic';
import { adjustForSkew, compareDates, relativeToNow } from 'utils/date';
import { safeCompare } from 'components/ResourceView';

function reportProblemAction(): Messages.MessageAction {

  const url = buildFeedbackFromCurrent('', '');
  
  return {
    label: 'Report Problem',
    execute: (message, dispatch) => {
      window.open(url, 'ReportProblemTab');
    },
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
  guid: string,
  id: string,
  version: string,
  title: string,
  description: string,
  buildStatus: string,
  dateCreated: Date,
};

export type CoursesViewProps = {
  serverTimeSkewInMs: number,
  userId: string,
  dispatch: any,
};

export type CoursesViewState = {
  courses: Maybe<CourseDescription[]>,
  searchText: string,
};

class CoursesViewSearchable extends React.PureComponent<CoursesViewProps, CoursesViewState> {
  onSelect: (string) => void;

  constructor(props) {
    super(props);

    this.state = {
      courses: Maybe.nothing<CourseDescription[]>(),
      searchText: '',
    };
    this.onSelect = id => this.props.dispatch(viewActions.viewCourse(id));
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

  createCourse = () => this.props.dispatch(viewActions.viewCreateCourse());
  importCourse = () => this.props.dispatch(viewActions.viewImportCourse());

  componentDidMount() {
    persistence.getEditablePackages()
      .then((docs) => {
        const courses: CourseDescription[] = docs.map(d => ({
          guid: d.guid,
          id: d.id,
          version: d.version,
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
        console.log(err);
        this.props.dispatch(messageActions.showMessage(errorMessageAction()));
      });

  }

  render() {
    return (
      <div className="courses-view">
        <div className="my-course-packages">
          <h2 style={{ display: 'inline' }}>My Courses</h2>
          { 
            this.state.courses.caseOf({
              just: courses => courses.length === 0 ? <NoCourses/> :
                <CoursesViewSearchableTable 
                searchText={this.state.searchText}
                textChange={this.textChange}
                serverTimeSkewInMs={this.props.serverTimeSkewInMs}
                createCourse={this.createCourse}
                importCourse={this.importCourse}
                rows={this.filterCourses()} 
                onSelect={this.onSelect}
                />,
              nothing: () => <Waiting/>,
            })
          }
        </div>
      </div>
    );
  }
}

function Waiting(): JSX.Element {
  return (
    <div className="lead" style={{ width: '175px' }} >
      <LoadingSpinner message="Loading courses..." />
    </div>
  );
}

function NoCourses(): JSX.Element {
  return (
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
  );
}


function TableToolbar({ textChange, createCourse, importCourse }): JSX.Element {
  return (
      <div className="table-toolbar">
        <SearchBar
          className="inlineSearch"
          placeholder="Search by Title, Version or Unique ID"
          onChange={textChange}
        />
        <div className="input-group">
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
        </div>
      </div>
  );
}

function CoursesViewSearchableTable({ rows, onSelect, searchText, serverTimeSkewInMs,
  textChange, createCourse, importCourse }): JSX.Element {

  const labels = [
    'Title',
    'Version',
    'Unique ID',
    'Created',
  ];

  const link = course => span =>
      <button onClick={() => onSelect(course.guid)}
        className="btn btn-link">{span}</button>;

  const columnRenderers = [
    r => link(r)(highlightedColumnRenderer('title', r)),
    r => highlightedColumnRenderer('version', r),
    r => highlightedColumnRenderer('id', r),
    r => <span>{relativeToNow(
      adjustForSkew(r.dateCreated, serverTimeSkewInMs))}</span>,
  ];

  const highlightedColumnRenderer = (prop: string, r: CourseDescription) => 
    searchText.length < 3
      ? <span>{r[prop]}</span>
      : highlightMatches(prop, r, searchText);

  const comparators = [
    (direction, a, b) => safeCompare('title', 'id', direction, a, b),
    (direction, a, b) => safeCompare('id', 'title', direction, a, b),
    (direction, a, b) => safeCompare('version', 'title', direction, a, b),
    (direction, a, b) => direction === SortDirection.Ascending
      ? compareDates(a.dateCreated, b.dateCreated)
      : compareDates(b.dateCreated, a.dateCreated),
  ];

  return (
    <div className="resource-view container-fluid new">
      <div className="row">
        <div className="col-sm-12 col-md-12 document">
          <div className="container-fluid editor">
            <div className="row">
              <div className="col-12">
                <TableToolbar importCourse={importCourse} textChange={textChange}
                createCourse={createCourse}/>
                <SortableTable
                model={rows.map(r => ({ key: r.guid, data: r }))}
                columnComparators={comparators}
                columnRenderers={columnRenderers}
                columnLabels={labels} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoursesViewSearchable;
