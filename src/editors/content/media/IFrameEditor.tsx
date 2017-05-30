import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { ContentState } from 'draft-js';

import { IFrame }  from '../../../data/content/html/iframe';
import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import guid from '../../../utils/guid';

import { LabeledType, LabeledEditor } from '../labeled/LabeledEditor';
import { RichTextEditor } from '../common/RichTextEditor';
import { TextInput } from '../common/TextInput';
import { InputLabel } from '../common/InputLabel';

import '../common/editor.scss';


export interface IFrameEditor {
  
}

export interface IFrameEditorProps extends AbstractContentEditorProps<IFrame> {
  
}

export interface IFrameEditorState {
  
}

/**
 * The content editor for Table.
 */
export class IFrameEditor 
  extends AbstractContentEditor<IFrame, IFrameEditorProps, IFrameEditorState> {
    
  constructor(props) {
    super(props);
    
    this.onLabeledEdit = this.onLabeledEdit.bind(this);
    this.onSrcEdit = this.onSrcEdit.bind(this);
    this.onHeightEdit = this.onHeightEdit.bind(this);
    this.onWidthEdit = this.onWidthEdit.bind(this);
    this.onPopoutEdit = this.onPopoutEdit.bind(this);
    this.onAlternateEdit = this.onAlternateEdit.bind(this);
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

  onPopoutEdit(content: string) {
    const popout = this.props.model.popout.with({ content });
    this.props.onEdit(this.props.model.with({ popout }));
  }

  onAlternateEdit(content: ContentState) {
    const alternate = this.props.model.alternate.with({ content });
    this.props.onEdit(this.props.model.with({ alternate }));
  }

  onSrcEdit(src: string) {
    this.props.onEdit(this.props.model.with({ src }));
  }

  onHeightEdit(height: string) {
    this.props.onEdit(this.props.model.with({ height }));
  }

  onWidthEdit(width: string) {
    this.props.onEdit(this.props.model.with({ width }));
  }

  render() : JSX.Element {

    const { titleContent, caption, cite, popout, alternate } = this.props.model;

    const labeled : LabeledType = {
      titleContent,
      caption,
      cite,
    };

    return (
      <div className="itemWrapper">
        <LabeledEditor 
          {...this.props}
          model={labeled} 
          onEdit={this.onLabeledEdit}
          />

        <InputLabel label="Popout">
          <TextInput width="100%" label="Popout content"
            editMode={this.props.editMode} 
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

        <InputLabel label="Source">
          <TextInput width="75px" label="Source" 
            editMode={this.props.editMode}
            value={this.props.model.src} 
            type="text"
            onEdit={this.onSrcEdit}
          />
        </InputLabel>
        <InputLabel label="Height">
          <TextInput width="75px" label="Height in pixels" 
            editMode={this.props.editMode}
            value={this.props.model.height} 
            type="text"
            onEdit={this.onHeightEdit}
          />
        </InputLabel>
        <InputLabel label="Width">
          <TextInput width="75px" label="Width in pixels" 
            editMode={this.props.editMode}
            value={this.props.model.width} 
            type="text"
            onEdit={this.onWidthEdit}
          />
        </InputLabel>
      </div>);
  }

}

