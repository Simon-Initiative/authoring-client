import * as React from 'react';
import * as Immutable from 'immutable';
import * as persistence from 'data/persistence';
import * as viewActions from 'actions/view';
import * as messageActions from 'actions/messages';
import * as Messages from 'types/messages';
import { Maybe } from 'tsmonad';
import { buildFeedbackFromCurrent } from 'utils/feedback';

import './CoursesView.scss';
import { LoadingSpinner } from 'components/common/LoadingSpinner';

type CourseDescription = {
  guid: string,
  id: string,
  version: string,
  title: string,
  description: string,
  buildStatus: string,
};

export interface CoursesViewProps {
  userId: string;
  dispatch: any;
}

export interface CoursesViewState {
  courses: Maybe<CourseDescription[]>;
}


function buildReportProblemAction(): Messages.MessageAction {

  const url = buildFeedbackFromCurrent(
    '',
    '',
  );

  return {
    label: 'Report Problem',
    execute: (message, dispatch) => {
      window.open(url, 'ReportProblemTab');
    },
  };
}

function buildErrorMessage(): Messages.Message {

  const content = new Messages.TitledContent().with({
    title: 'Error contacting server',
    message: 'Try reloading the page. If the problem persists, please contact support.',
  });

  return new Messages.Message().with({
    content,
    actions: Immutable.List([buildReportProblemAction(), Messages.RELOAD_ACTION]),
    severity: Messages.Severity.Error,
    scope: Messages.Scope.Application,
  });
}

class CoursesView extends React.PureComponent<CoursesViewProps, CoursesViewState> {
  onSelect: (id: string) => void;

  constructor(props) {
    super(props);

    this.state = { courses: Maybe.nothing<CourseDescription[]>() };
    this.createCourse = this.createCourse.bind(this);
    this.onSelect = (id) => {
      this.props.dispatch(viewActions.viewCourse(id));
    };
  }

  createCourse() {
    this.props.dispatch(viewActions.viewCreateCourse());
  }

  importExisting() {
    this.props.dispatch(viewActions.viewImportCourse());
  }


  componentDidMount() {
    persistence.getEditablePackages()
      .then((docs) => {
        const courses: CourseDescription[] = docs.map(d => ({
          guid: d.guid,
          id: d.id,
          version: d.version,
          title: d.title,
          description: d.description,
          buildStatus: d.buildStatus,
        }));
        this.setState({ courses: Maybe.just(courses) });
      })
      .catch((err) => {
        console.log(err);
        this.props.dispatch(messageActions.showMessage(buildErrorMessage()));
      });

  }

  renderActionBar() {
    return (
      <div style={{ display: 'inline', float: 'right' }}>
        <button
          type="button" className="btn btn-primary" key="createNew"
          onClick={this.createCourse.bind(this)}>
          <b>Create new</b>
        </button>
        &nbsp;&nbsp;
        <button
          type="button" className="btn btn-primary" key="import"
          onClick={this.importExisting.bind(this)}>
          <b>Import existing</b>
        </button>
      </div>
    );
  }

  renderCourses(courses: CourseDescription[]) {
    return courses
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((c, i) => {

        const { guid, version, title, buildStatus } = c;

        const isReady = buildStatus === 'READY';

        const button =
          <button
            disabled={!isReady}
            type="button" className="btn btn-link" key={guid}
            onClick={this.onSelect.bind(this, guid)}>
            <b>
              {title + ' - v' + version + (isReady ? '' : ' (Import in process)')}
            </b>
          </button>;

        return (
          <div key={guid}>
            <div className="content ">
              <div className="row">
                <div className="col-5">
                  {button}
                </div>
              </div>
            </div>
          </div>
        );
      });
  }

  renderNoCourses() {
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

  renderWaiting() {
    return (
      <div className="lead" style={{ width: '175px' }} >
        <LoadingSpinner message="Loading courses..." />
      </div>
    );
  }

  render() {
    return (
      <div className="courses-view">
        <div className="my-course-packages">
          <h2 style={{ display: 'inline' }}>My Courses</h2>

          {this.renderActionBar()}

          <div style={{ marginTop: '30px' }}>
            {this.state.courses.caseOf({
              just: courses => courses.length === 0
                ? this.renderNoCourses()
                : this.renderCourses(courses),
              nothing: () => this.renderWaiting(),
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default CoursesView;
