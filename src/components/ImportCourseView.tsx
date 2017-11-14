import * as React from 'react';
import guid from '../utils/guid';
import * as persistence from '../data/persistence';
import * as models from '../data/models';
import * as courseActions from '../actions/course';
import * as viewActions from '../actions/view';

interface ImportCourseView {

}

export interface ImportCourseViewProps {
  dispatch: any;
}

export interface ImportCourseViewState {
  waiting: boolean;
  error: boolean;
}

class ImportCourseView extends React.PureComponent<ImportCourseViewProps, ImportCourseViewState> {

  constructor(props) {
    super(props);
    this.onCancel = this.onCancel.bind(this);

    this.state = {
      waiting: false,
      error: false,
    };
  }

  startCreation(url: string) {
    persistence.importPackage(url);
  }

  import(e) {
    e.preventDefault();

    const url = (this.refs['url'] as any).value;
    if (url === undefined || url === null) {
      return;
    }

    this.setState({ waiting: true }, () => this.startCreation(url));
  }

  onCancel() {
    viewActions.viewAllCourses();
  }

  render() {

    const inputs = (
      <div className="col-md-4 offset-sm-4">
        <button onClick={this.import.bind(this)}
                style={{ color: 'white ' }}
                className="btn btn-secondary btn-lg btn-block outline serif">
          Import Course
        </button>
        <button onClick={this.onCancel}
                style={{ color: 'white ' }}
                className="btn btn-secondary btn-lg btn-block serif">
          Cancel
        </button>
      </div>
    );

    const waiting = (
      <div className="col-md-4 offset-sm-4">
        <div className="alert alert-info" role="alert">
          <h4 className="alert-heading">Course Import in Progress</h4>
          <p>Your course is being imported. </p>
          <p className="mb-0">This may take several minutes, depending on
          the size of the course. Upon completion of the import you will
            be taken to the front page of the new course.
          </p>
          <p className="mb-0">If you navigate away from this page before
          the import completes you
          can check on the status of the import from the
          &quot;Course Packages&quot; view.
          </p>
        </div>
      </div>
    );

    const error = (
      <div className="col-md-4 offset-sm-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>A problem was encountered trying to import the course</p>
          <p className="mb-0">Please try again, if the problem persists please
            contact support.
          </p>
        </div>
      </div>
    );

    return (
      <div className="createCourse full container-fluid">
        <div className="row">
          <div className="col-md-12">
            <h1>Import an existing course content package</h1>

          </div>
        </div>
        <div className="row">
          <fieldset>
            <input type="text" ref="url" className="col-md-12" id="input"
                   placeholder="Enter the full path of the location of course SVN repository"/>
            <label htmlFor="input">SVN URL</label>
          </fieldset>
        </div>
        <div className="row">
          {this.state.waiting
            ? waiting
            : this.state.error
              ? error
              : inputs }
        </div>
      </div>
    );
  }
}

export default ImportCourseView;
