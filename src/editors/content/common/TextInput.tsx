import * as React from 'react';

export interface TextInputProps {
  editMode: boolean;
  width: string;
  label: string;
  value: string;
  type: string;
  onEdit: (value: string) => void;
  hasError?: boolean;
}

export interface TextInputState {

}

export class TextInput extends React.PureComponent<TextInputProps, TextInputState> {
  caret: number;
  ref: HTMLInputElement;

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  componentDidUpdate(nextProps) {
    // set cursor to correct position. Fixes an issue with react controlled inputs
    // https://searler.github.io/react.js/2014/04/11/React-controlled-text.html
    if (this.ref.type === 'text') {
      this.ref.setSelectionRange(this.caret, this.caret);
    }
  }

  onChange(e) {
    const { onEdit } = this.props;

    this.caret = e.target.selectionStart;
    const value = e.target.value;
    onEdit(value);
  }

  render() {
    return (
      <input
        ref={r => this.ref = r}
        disabled={!this.props.editMode}
        style={{ width: this.props.width }}
        placeholder={this.props.label}
        onChange={this.onChange}
        className={`form-control form-control-sm ${this.props.hasError ? 'is-invalid' : ''}`}
        type={this.props.type}
        value={this.props.value} />
    );
  }
}
