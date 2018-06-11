import * as React from 'react';
import * as Immutable from 'immutable';
import * as persistence from 'data/persistence';
import * as viewActions from 'actions/view';
import { showMessage } from 'actions/messages';
import * as Messages from 'types/messages';

import './CourseCreation.scss';
import { Severity, Toast } from 'components/common/Toast';

export interface CourseCreationProps {
  pageTitle: string;
  buttonLabel: string;
  inputPlaceholder: string;
  toast?: JSX.Element;
  onSubmit: () => void;
}

export interface CourseCreationState {
  disabled: boolean;
  inputText: string;
}

export class CourseCreation
  extends React.PureComponent<CourseCreationProps, CourseCreationState> {

  constructor(props) {
    super(props);

    this.state = {
      disabled: true,
      inputText: '',
    };

    this.onChange = this.onChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  onChange(e) {
    const value: string = e.target.value;

    this.setState({
      inputText: value,
      disabled: value.trim() === '',
    });
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.props.onSubmit();
    }
  }

  render() {
    const { pageTitle, buttonLabel, inputPlaceholder, toast, onSubmit } = this.props;
    const { disabled, inputText } = this.state;

    const button =
      <div className="creation-container">
        <button disabled={disabled}
          onClick={onSubmit}>
          {buttonLabel}
        </button>
      </div>;

    return (
      <div className="course-creation full container-fluid">
        <div className="import-content">
          <h2>{pageTitle}</h2>
          <input
            value={inputText}
            onChange={this.onChange}
            onKeyPress={this.handleKeyPress}
            type="text"
            className="url-input" id="input"
            placeholder={inputPlaceholder} />
          {button}
          <br />
          {toast}
        </div>
      </div >
    );
  }
}
