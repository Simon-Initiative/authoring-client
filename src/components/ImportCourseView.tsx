import * as React from 'react';
import guid from 'utils/guid';
import * as persistence from 'data/persistence';
import * as models from 'data/models';
import * as courseActions from 'actions/course';
import * as viewActions from 'actions/view';

import './ImportCourseView.scss';

export interface ImportCourseViewProps {
  dispatch: any;
}

export interface ImportCourseViewState {

}

export class ImportCourseView
  extends React.PureComponent<ImportCourseViewProps, ImportCourseViewState> {

  constructor(props) {
    super(props);
    this.onCancel = this.onCancel.bind(this);
    this.onImport = this.onImport.bind(this);
  }

  onImport() {

    const url = (this.refs['url'] as any).value;
    if (url === undefined || url === null) {
      return;
    }

    persistence.importPackage(url);

    viewActions.viewAllCourses();
  }

  onCancel() {
    viewActions.viewAllCourses();
  }

  render() {

    const inputs = (
      <div className="col-md-4 offset-sm-4">
        <button onClick={this.onImport.bind(this)}
                className="btn btn-secondary btn-lg btn-block outline serif">
          Import Course
        </button>
        <button onClick={this.onCancel}
                style={{ color: 'white ' }}
                className="btn btn-cancel btn-lg btn-block serif">
          Cancel
        </button>
      </div>
    );

    return (
      <div className="import-course-view full container-fluid">
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
        {inputs}
        <br/>
        <div className="row">
          <div className="col-md-8 offset-sm-2">
            <div className="alert alert-info" role="alert">
              <h4 className="alert-heading">Note</h4>
              <p className="mb-0">Importing an existing OLI course package
              can take several minutes, especially if the course package
              is large and contains many assets.
              </p>
              <br/>
              <p className="mb-0">After you initiate an import, you will
              be taken to the
              &quot;My Course Packages&quot; page, where you can see the status
              of the course package that you are importing.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
