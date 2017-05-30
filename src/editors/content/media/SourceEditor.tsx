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
  failure: boolean;
}

/**
 * The content editor for Table.
 */
export class SourceEditor 
  extends AbstractContentEditor<Source, SourceEditorProps, SourceEditorState> {
    
  constructor(props) {
    super(props);
    
    this.onFileChange = this.onFileChange.bind(this);

    this.state = {
      failure: false,
    };
  }

  shouldComponentUpdate(nextProps, nextState: SourceEditorState) {
    if (nextProps.model !== this.props.model) {
      return true;
    } else if (nextState.failure !== this.state.failure) {
      return true;
    }
    return false;
  }

  onFileChange(e) {
    const file = e.target.files[0];
    
    persistence.createWebContent(this.props.context.courseId, file)
    .then((result) => {
      this.setState(
        { failure: false }, 
        () => this.props.onEdit(this.props.model.with({ src: file.name })));
    })
    .catch((err) => {
      this.setState({ failure: true });
    });
  }

  openFileDialog(id) {
    (window as any).$('#' + id).trigger('click');
  }

  render() : JSX.Element {

    const { src, type } = this.props.model;
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
          {srcDisplay}
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

