import * as React from 'react';
import guid from '../../../utils/guid';

export interface TextInputProps {
  editMode: boolean;
  width: string;
  label: string;
  value: string;
  type: string;
  onEdit: (value: string) => void;
}

export interface TextInputState {
  value: string;
}

export class TextInput extends React.Component<TextInputProps, TextInputState> {
  id: string;

  constructor(props) {
    super(props);

    this.id = guid();

    this.state = {
      value: this.props.value,
    };

    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    this.setState({ value: this.props.value });
  }

  onChange(e) {
    const value = e.target.value;

    this.setState({ value });
    this.props.onEdit(value);
  }

  render() {
    return (
      <input
        disabled={!this.props.editMode}
        style={ { width: this.props.width } }
        placeholder={this.props.label}
        onChange={this.onChange}
        className="form-control form-control-sm"
        type={this.props.type}
        value={this.state.value}
        id={this.id}/>
    );
  }

}

