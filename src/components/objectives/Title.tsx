import * as React from 'react';
import * as Immutable from 'immutable';
import * as t from '../../data/contentTypes';
import * as models from '../../data/models';
import { Maybe } from 'tsmonad';
import guid from '../../utils/guid';
import { TextInput } from '../../editors/content/common/TextInput';

export interface TitleProps {
  title: string;
  editMode: boolean;
  isHoveredOver: boolean;
  onEdit: (string) => void;
  onToggleExpanded: () => void;
}

export interface TitleState {
  isEditing: boolean;
  title: string;
}

const ESCAPE_KEYCODE = 27;
const ENTER_KEYCODE = 13;

export class Title
  extends React.PureComponent<TitleProps, TitleState> {
  titleInput: any;

  constructor(props) {
    super(props);

    this.state = { isEditing: false, title: props.title };

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onBeginEdit = this.onBeginEdit.bind(this);
    this.onTextChange = this.onTextChange.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  onTitleEdit() {
    const title = this.titleInput.value;
    this.setState(
      { isEditing: false },
      () => this.props.onEdit(title));
  }

  onCancel() {
    this.setState({ isEditing: false, title: this.props.title });
  }

  onBeginEdit() {
    this.setState({ isEditing: true });
  }

  onTextChange(e) {
    this.setState({ title: e.target.value });
  }

  onKeyUp(e) {
    if (e.keyCode === ESCAPE_KEYCODE) {
      this.onCancel();
    } else if (e.keyCode === ENTER_KEYCODE) {
      this.onTitleEdit();
    }
  }


  render() : JSX.Element {

    const { title, editMode } = this.props;

    if (this.state.isEditing) {
      return (
        <div style={ { display: 'inline', marginLeft: '40px' } }>
          <input ref={a => this.titleInput = a} type="text" onKeyUp={this.onKeyUp}
            onChange={this.onTextChange}
            value={this.state.title} style={ { width: '50%', paddingTop: '2px' } }/>
          <button
            key="save"
            onClick={this.onTitleEdit}
            type="button"
            className="btn btn-sm">
            Done
          </button>
          <button
            key="cancel"
            onClick={this.onCancel}
            type="button"
            className="btn btn-sm">
            Cancel
          </button>
        </div>
      );
    } else {
      const linkStyle : any = {
        color: 'black',
        fontWeight: 'normal',
      };
      const label : any = {
        fontFamily: 'sans-serif',
        lineHeight: 1.25,
        fontSize: '12',
        position: 'relative',
        top: '-6',
        color: '#606060',
      };
      const renameButton = this.props.isHoveredOver && this.props.editMode
          ? <button
              key="rename"
              onClick={this.onBeginEdit}
              type="button"
              className="btn btn-link btn-sm">
              Rename
            </button>
          : null;

      return (
        <div style={ { display: 'inline' } }
          >
          <button key="itemClick" onClick={() => this.props.onToggleExpanded()}
          type="button" style={linkStyle} className="btn btn-link">{this.props.children}</button>
          {renameButton}
        </div>
      );
    }


  }

}

