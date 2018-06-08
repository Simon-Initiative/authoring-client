import * as React from 'react';
import * as Immutable from 'immutable';
import * as persistence from 'data/persistence';
import * as viewActions from 'actions/view';
import { showMessage } from 'actions/messages';
import * as Messages from 'types/messages';

import './ImportCourseView.scss';
import { Severity, Toast } from 'components/common/Toast';

const BOOK_IMAGE = require('../../assets/book.svg');

export interface ImportCourseViewProps {
  dispatch: any;
}

export interface ImportCourseViewState {
  disabled: boolean;
  inputText: string;
}

function buildImportMessage(): Messages.Message {

  const content = new Messages.TitledContent().with({
    title: 'Importing course',
    message: 'Your course is importing. To check on the progress,'
      + ' reload the page.',
  });

  return new Messages.Message().with({
    content,
    actions: Immutable.List([Messages.RELOAD_ACTION]),
    canUserDismiss: true,
    severity: Messages.Severity.Information,
    scope: Messages.Scope.Resource,
  });
}

export class ImportCourseView
  extends React.PureComponent<ImportCourseViewProps, ImportCourseViewState> {

  constructor(props) {
    super(props);

    this.state = {
      disabled: true,
      inputText: '',
    };

    this.onChange = this.onChange.bind(this);
    this.onImport = this.onImport.bind(this);
  }

  onChange(e) {
    const value: string = e.target.value;

    this.setState({
      inputText: value,
      disabled: value.trim() === '',
    });
  }

  onImport(e) {
    e.preventDefault();

    persistence.importPackage(this.state.inputText.trim());
    this.props.dispatch(viewActions.viewAllCourses());
    this.props.dispatch(showMessage(buildImportMessage()));
  }

  render() {

    const button = (
      <div className="col-md-6 offset-md-3">
        <div className="creationContainer">
          <button disabled={this.state.disabled}
            onClick={this.onImport.bind(this)}>
            Import Course
        </button>
        </div>
      </div>
    );

    const noteIcon = <i className="fa fa-exclamation-circle" />;
    const noteHeading = 'Note';
    const noteContent = <React.Fragment>
      <p>Importing an existing OLI course can take several minutes,
        especially if the course is large and contains many assets.
      </p>
      <br />
      <p>After you initiate an import, you will be taken to the
        &quot;My Courses&quot; page, where you can see the status
        of the course that you are importing.
      </p>
    </React.Fragment>;
    const note = (
      <div className="col-md-6 offset-md-3">
        <Toast
          icon={noteIcon}
          heading={noteHeading}
          content={noteContent}
          severity={Severity.Info} />
      </div>
    );

    return (
      <div className="import-course-view full container-fluid">
        <div className="row">
          <div className="col-md-6 offset-md-3">
            <h2>Import an existing course</h2>
          </div>
        </div>
        <div className="row">
          <fieldset>
            <input
            value={this.state.inputText}
            onChange={this.onChange}
            type="text"
            className="col-md-6 offset-md-3" id="input"
            placeholder="e.g. https://svn.oli.cmu.edu/svn/content/biology/intro_biology/trunk/" />
          </fieldset>
        </div>
        {button}
        <br />
        <div className="row">
          {note}
        </div>
      </div>
    );
  }
}
