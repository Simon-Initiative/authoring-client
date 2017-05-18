import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';

import { ContentState } from 'draft-js';

import { Video }  from '../../../data/content/html/Video';
import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import guid from '../../../utils/guid';
import { extractFileName } from './utils';

import { LabeledType, LabeledEditor } from '../labeled/LabeledEditor';
import { RichTextEditor } from '../common/RichTextEditor';
import { TextInput } from '../common/TextInput';
import { InputLabel } from '../common/InputLabel';
import { Button } from '../common/Button';

import '../common/editor.scss';


export interface VideoEditor {
  
}

export interface VideoEditorProps extends AbstractContentEditorProps<Video> {
  
}

export interface VideoEditorState {
  
}

/**
 * The content editor for Table.
 */
export class VideoEditor 
  extends AbstractContentEditor<Video, VideoEditorProps, VideoEditorState> {
    
  constructor(props) {
    super(props);
    
    this.onLabeledEdit = this.onLabeledEdit.bind(this);
    this.onSetClick = this.onSetClick.bind(this);
    this.onPopoutEdit = this.onPopoutEdit.bind(this);
    this.onAlternateEdit = this.onAlternateEdit.bind(this);
    this.onTypeEdit = this.onTypeEdit.bind(this);
    this.onControlEdit = this.onControlEdit.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    return false;
  }

  onLabeledEdit(model: LabeledType) {

    const { titleContent, cite, caption } = model;
    const updated = this.props.model.with({ titleContent, cite, caption });
   
    this.props.onEdit(updated);
  }

  onPopoutEdit(content: ContentState) {
    const popout = this.props.model.popout.with({ content });
    this.props.onEdit(this.props.model.with({ popout }));
  }

  onAlternateEdit(content: ContentState) {
    const alternate = this.props.model.alternate.with({ content });
    this.props.onEdit(this.props.model.with({ alternate }));
  }

  onTypeEdit(type: string) {
    this.props.onEdit(this.props.model.with({ type }));
  }

  onControlEdit(e) {
    const controls = e.checked;
    this.props.onEdit(this.props.model.with({ controls }));
  }

  onSetClick() {
    // TODO 
  }

  render() : JSX.Element {

    const { titleContent, caption, cite, src, type, popout, alternate } = this.props.model;
    const srcDisplay = src === '' ? '<not set>' : extractFileName(src);
    
    const labeled : LabeledType = {
      titleContent,
      caption,
      cite,
    };

    return (
      <div className="itemWrapper">

        <div className="input-group">
          <span className="input-group-addon">Source</span>
            {srcDisplay}
          <span className="input-group-addon">
            <Button onClick={this.onSetClick}>Set</Button>
          </span>
        </div>

        <InputLabel label="Type">
          <TextInput width="100%" label="Source type" 
            value={type} 
            type="text"
            onEdit={this.onTypeEdit}
          />
        </InputLabel>

        <InputLabel label="Controls">
          <label className="form-check-label">
            <input type="checkbox" 
              onClick={this.onControlEdit}
              className="form-check-input" 
              checked={this.props.model.controls}
              value="option1"/>
            Display video controls
          </label>
        </InputLabel>

        <LabeledEditor 
          {...this.props}
          model={labeled} 
          onEdit={this.onLabeledEdit}
          />

        <InputLabel label="Popout">
          <TextInput width="100%" label="Popout content" 
            value={popout.content} 
            type="text"
            onEdit={this.onPopoutEdit}
          />
        </InputLabel>

        <RichTextEditor
          label="Alternate"
          {...this.props}
          onEdit={this.onAlternateEdit}
          model={alternate.content}
        />
        
      </div>);
  }

}

