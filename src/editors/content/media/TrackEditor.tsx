import * as React from 'react';
import * as persistence from 'data/persistence';
import { Track } from 'data/content/learning/track';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import guid from 'utils/guid';
import { extractFileName, adjustPath } from 'editors/content/media/utils';
import { TextInput } from 'editors/content/common/TextInput';
import { Button } from 'editors/content/common/Button';

export interface TrackEditorProps extends AbstractContentEditorProps<Track> {
  onRemove: (guid: string) => void;
  mediaType: string;
  accept: string;
}

export interface TrackEditorState {
  failure: boolean;
}

/**
 * The content editor for Table.
 */
export class TrackEditor
  extends AbstractContentEditor<Track, TrackEditorProps, TrackEditorState> {

  constructor(props) {
    super(props);

    this.onKindEdit = this.onKindEdit.bind(this);
    this.onDefaultEdit = this.onDefaultEdit.bind(this);
    this.onLabelEdit = this.onLabelEdit.bind(this);
    this.onLangEdit = this.onLangEdit.bind(this);
    this.onFileChange = this.onFileChange.bind(this);

    this.state = {
      failure: false,
    };
  }

  shouldComponentUpdate(nextProps, nextState: TrackEditorState) {
    if (nextProps.activeContentGuid !== this.props.activeContentGuid) {
      return true;
    }
    if (nextProps.model !== this.props.model) {
      return true;
    }
    if (nextProps.context !== this.props.context) {
      return true;
    }
    if (nextState.failure !== this.state.failure) {
      return true;
    }
    return false;
  }

  onKindEdit(kind: string) {
    this.props.onEdit(this.props.model.with({ kind }));
  }

  onLabelEdit(label: string) {
    this.props.onEdit(this.props.model.with({ label }));
  }

  onLangEdit(srclang: string) {
    this.props.onEdit(this.props.model.with({ srclang }));
  }

  onDefaultEdit(def: string) {
    this.props.onEdit(this.props.model.with({ default: def }));
  }

  onFileChange(e) {
    const file = e.target.files[0];

    persistence.createWebContent(this.props.context.courseId, file)
    .then((result) => {
      this.setState(
        { failure: false },
        () => this.props.onEdit(this.props.model.with({
          src: adjustPath(result, this.props.context.resourcePath) })));
    })
    .catch((err) => {
      this.setState({ failure: true });
    });
  }

  openFileDialog(id) {
    (window as any).$('#' + id).trigger('click');
  }

  renderSidebar() {
    return null;
  }
  renderToolbar() {
    return null;
  }

  renderMain() : JSX.Element {

    const { src, kind, label, srclang } = this.props.model;
    let srcDisplay;
    if (!this.state.failure) {
      srcDisplay = src === '' ? '<not set>' : extractFileName(src);
    } else {
      srcDisplay =
        <div className="alert alert-danger" role="alert">
          <strong>Failed</strong> Rename the file and try again
        </div>;
    }
    const id : string = guid();

    return (
      <tr>
        <td>
          <input
            id={id}
            style={ { display: 'none' } }
            accept={this.props.accept}
            onChange={this.onFileChange}
            type="file"
          />
          <Button editMode={this.props.editMode}
            onClick={this.openFileDialog.bind(this, id)}>Set</Button>
        </td>
        <td>
          <b>{srcDisplay}</b>
        </td>
        <td>
          <TextInput width="75px" label=""
            editMode={this.props.editMode}
            onEdit={this.onKindEdit}
            value={kind} type="text"/>
        </td>
        <td>
          <TextInput width="75px" label=""
            editMode={this.props.editMode}
            onEdit={this.onLabelEdit}
            value={label} type="text"/>
        </td>
        <td>
          <TextInput width="75px" label=""
            editMode={this.props.editMode}
            onEdit={this.onLangEdit}
            value={srclang} type="text"/>
        </td>
        <td>
          <TextInput width="75px" label=""
            editMode={this.props.editMode}
            onEdit={this.onDefaultEdit}
            value={this.props.model.default} type="text"/>
        </td>
        <td>
          <span
            className="closebtn input-group-addon"
            onClick={() => this.props.onRemove(this.props.model.guid)}>
            &times;
          </span>
        </td>
      </tr>);
  }

}

