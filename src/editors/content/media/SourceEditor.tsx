import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';

import { Source }  from '../../../data/content/html/source';
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

  render() : JSX.Element {

    const { src, type, guid } = this.props.model;
    const srcDisplay = src === '' ? '<not set>' : extractFileName(src);

    return (
      <tr>
        <td style={ { width: '75px' } }>    
          <Button onClick={this.onSrcClick}>Set</Button>
        </td>
        <td>
          <b>{srcDisplay}</b>
        </td>
        <td style={ { width: '50px' } }>
          <span 
            className="closebtn input-group-addon" 
            onClick={() => this.props.onRemove(guid)}>
            &times;
          </span>
        </td>
      </tr>);
  }

}

