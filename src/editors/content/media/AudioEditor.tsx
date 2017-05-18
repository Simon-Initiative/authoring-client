import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { ContentState } from 'draft-js';

import { Audio }  from '../../../data/content/html/audio';
import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import guid from '../../../utils/guid';
import { extractFileName } from './utils';
import { Sources } from './Sources';
import { Tracks } from './Tracks';
import { LabeledType, LabeledEditor } from '../labeled/LabeledEditor';
import { RichTextEditor } from '../common/RichTextEditor';
import { TextInput } from '../common/TextInput';
import { InputLabel } from '../common/InputLabel';
import { Button } from '../common/Button';

import '../common/editor.scss';


export interface AudioEditor {
  
}

export interface AudioEditorProps extends AbstractContentEditorProps<Audio> {
  
}

export interface AudioEditorState {
  
}

/**
 * The content editor for Table.
 */
export class AudioEditor 
  extends AbstractContentEditor<Audio, AudioEditorProps, AudioEditorState> {
    
  constructor(props) {
    super(props);
    
    this.onLabeledEdit = this.onLabeledEdit.bind(this);
    this.onSetClick = this.onSetClick.bind(this);
    this.onPopoutEdit = this.onPopoutEdit.bind(this);
    this.onAlternateEdit = this.onAlternateEdit.bind(this);
    this.onControlEdit = this.onControlEdit.bind(this);
    this.onSourcesEdit = this.onSourcesEdit.bind(this);
    this.onTracksEdit = this.onTracksEdit.bind(this);
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

  onControlEdit(e) {
    const controls = e.checked;
    this.props.onEdit(this.props.model.with({ controls }));
  }

  onSourcesEdit(sources) {
    this.props.onEdit(this.props.model.with({ sources }));
  }

  onTracksEdit(tracks) {
    this.props.onEdit(this.props.model.with({ tracks }));
  }

  onSetClick() {
    // TODO 
  }

  render() : JSX.Element {

    const { titleContent, caption, cite, sources, tracks, popout, alternate } = this.props.model;
    
    const labeled : LabeledType = {
      titleContent,
      caption,
      cite,
    };

    return (
      <div className="itemWrapper">

        <Sources
          {...this.props}
          model={sources}
          onEdit={this.onSourcesEdit}
        />

        <Tracks
          {...this.props}
          model={tracks}
          onEdit={this.onTracksEdit}
        />

        <LabeledEditor 
          {...this.props}
          model={labeled} 
          onEdit={this.onLabeledEdit}
          />

        <InputLabel label="Controls">
          <label className="form-check-label">
            <input type="checkbox" 
              onClick={this.onControlEdit}
              className="form-check-input"
              checked={this.props.model.controls}
              value="option1"/>
            Display audio controls
          </label>
        </InputLabel>

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

