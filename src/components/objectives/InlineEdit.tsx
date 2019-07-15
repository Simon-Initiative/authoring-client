import * as React from 'react';
import { Button } from 'components/common/Button';
import { classNames } from 'styles/jss';
import { highlightMatches } from 'components/common/SearchBarLogic.tsx';

export interface InlineEditProps {
  value: string;
  editMode: boolean;
  isEditing: boolean;
  autoFocus?: boolean;
  inputStyle?: any;
  highlightText?: string;
  onCancel?: () => void;
  onChange?: (value: string) => void;
  onEdit: (value: string) => void;
}

export interface InlineEditState {
  value: string;
}

const ESCAPE_KEYCODE = 27;
const ENTER_KEYCODE = 13;

export class InlineEdit
  extends React.PureComponent<InlineEditProps, InlineEditState> {
  titleInput: any;

  constructor(props: InlineEditProps) {
    super(props);

    this.state = {
      value: props.value,
    };
  }

  onEdit = () => {
    const { onEdit } = this.props;
    const { value } = this.state;
    onEdit(value);
  }

  onCancel = () => {
    const { onCancel } = this.props;

    this.setState({ value: this.props.value });

    onCancel && onCancel();
  }

  onTextChange = (e) => {
    const { onChange } = this.props;

    this.setState({ value: e.target.value });

    onChange && onChange(e.target.value);
  }

  onKeyUp = (e) => {
    if (e.keyCode === ESCAPE_KEYCODE) {
      this.onCancel();
    } else if (e.keyCode === ENTER_KEYCODE) {
      this.onEdit();
    }
  }


  render(): JSX.Element {
    const { inputStyle, isEditing, value, editMode, highlightText } = this.props;

    if (isEditing) {
      return (
        <React.Fragment>
          <input
            ref={(titleInput) => {
              this.titleInput = titleInput;
              this.titleInput && this.titleInput.focus();
            }}
            type="text"
            style={inputStyle}
            onKeyUp={this.onKeyUp}
            onChange={this.onTextChange}
            onClick={e => e.stopPropagation()}
            value={this.state.value} />
          <Button
            className={classNames(['btn btn-sm'])}
            editMode={editMode}
            type="link"
            onClick={(e) => { this.onEdit(); e.stopPropagation(); }}>
            Done
          </Button>
          <Button
            className={classNames(['btn btn-sm', 'btn-remove'])}
            editMode={editMode}
            type="link"
            onClick={(e) => { this.onCancel(); e.stopPropagation(); }}>
            Cancel
          </Button>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        {highlightText ? highlightMatches(value, highlightText) : value}
      </React.Fragment>
    );
  }
}
