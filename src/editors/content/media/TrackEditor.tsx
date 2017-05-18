import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';

import { Track }  from '../../../data/content/html/Track';
import { AppServices } from '../../common/AppServices';
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
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    return false;
  }

  onSrcClick() {
    // TODO, allow uploading of a file
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

  render() : JSX.Element {

    const { src, kind, label, srclang, guid } = this.props.model;
    const srcDisplay = src === '' ? '<not set>' : extractFileName(src);

    return (
      <tr>
        <td>    
          <Button onClick={this.onSrcClick}>Set</Button>
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
            onClick={() => this.props.onRemove(guid)}>
            &times;
          </span>
        </td>
      </tr>);
  }

}

