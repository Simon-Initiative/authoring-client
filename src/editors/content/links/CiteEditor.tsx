import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import * as persistence from '../../../data/persistence';
import { Cite }  from '../../../data/content/html/cite';
import { AppServices } from '../../common/AppServices';
import { PurposeTypes } from '../../../data/content/html/common';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { InputLabel } from '../common/InputLabel';
import { TextInput } from '../common/TextInput';
import { Button } from '../common/Button';

import '../common/editor.scss';


export interface CiteEditor {
  
}

export interface CiteEditorProps extends AbstractContentEditorProps<Cite> {
  
}

export interface CiteEditorState {
  
}

/**
 * The content editor for Table.
 */
export class CiteEditor 
  extends AbstractContentEditor<Cite, CiteEditorProps, CiteEditorState> {
    
  constructor(props) {
    super(props);
    
    this.onEntryEdit = this.onEntryEdit.bind(this);

  }

  shouldComponentUpdate(nextProps, nextState: CiteEditorState) {
    if (nextProps.model !== this.props.model) {
      return true;
    } 
    return false;
  }

  onEntryEdit(entry) {
    this.props.onEdit(this.props.model.with({ entry }));
  }

  render() : JSX.Element {

    const { entry } = this.props.model;
    
    return (
      <div className="itemWrapper">

        <InputLabel label="Entry">
          <TextInput width="100%" label="" 
            value={entry} 
            type="text"
            onEdit={this.onEntryEdit}
          />
        </InputLabel>
        
      </div>);
  }

}

