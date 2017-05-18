import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import * as persistence from '../../../data/persistence';

import { Track }  from '../../../data/content/html/track';
import { AppServices } from '../../common/AppServices';
import { uploadFile } from '../common/UploadFile';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import guid from '../../../utils/guid';
import { extractFileName } from './utils';

import { TextInput } from '../common/TextInput';
import { InputLabel } from '../common/InputLabel';
import { Button } from '../common/Button';

import '../common/editor.scss';


export interface TrackEditor {
  
}

export interface TrackEditorProps extends AbstractContentEditorProps<Track> {
  onRemove: (guid: string) => void;
  mediaType: string;
  accept: string;
}

export interface TrackEditorState {
  
}

/**
 * The content editor for Table.
 */
export class TrackEditor 
  extends AbstractContentEditor<Track, TrackEditorProps, TrackEditorState> {
    
  constructor(props) {
    super(props);
    
    this.onSrcClick = this.onSrcClick.bind(this);
    this.onKindEdit = this.onKindEdit.bind(this);
    this.onDefaultEdit = this.onDefaultEdit.bind(this);
    this.onLabelEdit = this.onLabelEdit.bind(this);
    this.onLangEdit = this.onLangEdit.bind(this); 
    this.onFileChange = this.onFileChange.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    return false;
  }

  onSrcClick() {
    uploadFile(
      this.props.mediaType, this.props.accept, 
      this.props.context, this.props.services)
    .then(src => this.props.onEdit(this.props.model.with({ src })))
    .catch(err => console.log(err));
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
    .then((src) => {
      this.props.onEdit(this.props.model.with({ src }));
    })
    .catch(err => console.log(err));
  }

  openFileDialog(id) {
    (window as any).$('#' + id).trigger('click');
  }

  render() : JSX.Element {

    const { src, kind, label, srclang } = this.props.model;
    const srcDisplay = src === '' ? '<not set>' : extractFileName(src);
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
          <Button onClick={this.openFileDialog.bind(this, id)}>Set</Button>
        </td>
        <td>
          <b>{srcDisplay}</b>
        </td>
        <td>
          <TextInput width="75px" label="" 
            onEdit={this.onKindEdit}
            value={kind} type="text"/>
        </td>
        <td>
          <TextInput width="75px" label="" 
            onEdit={this.onLabelEdit}
            value={label} type="text"/>
        </td>
        <td>
          <TextInput width="75px" label="" 
            onEdit={this.onLangEdit}
            value={srclang} type="text"/>
        </td>
        <td>
          <TextInput width="75px" label="" 
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

