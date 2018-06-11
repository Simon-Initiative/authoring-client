import * as React from 'react';
import * as Immutable from 'immutable';
import * as persistence from 'data/persistence';
import * as viewActions from 'actions/view';
import { showMessage } from 'actions/messages';
import * as Messages from 'types/messages';

import './CourseCreation.scss';
import { Severity, Toast } from 'components/common/Toast';

export interface CourseCreationProps {
  title: string;
  buttonLabel: string;
  placeholder: string;
  toast?: JSX.Element;
  onSubmit: (inputText: string) => void;
  submitted?: boolean;
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
    this.submit = this.submit.bind(this);
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
      this.submit();
    }
  }

  submit() {
    this.props.onSubmit(this.state.inputText.trim());
  }

  render() {
    const { title, buttonLabel, placeholder, toast, onSubmit, submitted } = this.props;
    const { disabled, inputText } = this.state;

    const button =
      <div className="course-creation__button">
        <button
          className={submitted
            ? 'course-creation__button--submitted'
            : ''}
          disabled={disabled}
          onClick={this.submit}>
          {buttonLabel}
        </button>
      </div>;

    return (
      <div className="course-creation container-fluid">
        <div className="course-creation__content">
          <h1>{title}</h1>
          <input
            value={inputText}
            onChange={this.onChange}
            onKeyPress={this.handleKeyPress}
            type="text"
            className="course-creation__input" id="input"
            placeholder={placeholder} />
          {button}
          <br />
          {toast}
        </div>
      </div >
    );
  }
}
