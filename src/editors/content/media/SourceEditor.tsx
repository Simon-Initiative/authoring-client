import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import * as persistence from '../../../data/persistence';

import { Source }  from '../../../data/content/html/source';
import { uploadFile } from '../common/UploadFile';
import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import guid from '../../../utils/guid';
import { extractFileName } from './utils';

import { TextInput } from '../common/TextInput';
import { InputLabel } from '../common/InputLabel';
import { Button } from '../common/Button';

import '../common/editor.scss';


export interface SourceEditor {
  
}

export interface SourceEditorProps extends AbstractContentEditorProps<Source> {
  onRemove: (guid: string) => void;
  mediaType: string;
  accept: string;
}

export interface SourceEditorState {
  
}

/**
 * The content editor for Table.
 */
export class SourceEditor 
  extends AbstractContentEditor<Source, SourceEditorProps, SourceEditorState> {
    
  constructor(props) {
    super(props);
    
    this.onSrcClick = this.onSrcClick.bind(this);
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

    const { src, type } = this.props.model;
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
        <td style={ { width: '50px' } }>
          <span 
            className="closebtn input-group-addon" 
            onClick={() => this.props.onRemove(this.props.model.guid)}>
            &times;
          </span>
        </td>
      </tr>);
  }

}

