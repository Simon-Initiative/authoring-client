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

import { TabContainer } from '../common/TabContainer';

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
    
    this.onSetClick = this.onSetClick.bind(this);
    this.onPopoutEdit = this.onPopoutEdit.bind(this);
    this.onAlternateEdit = this.onAlternateEdit.bind(this);
    this.onControlEdit = this.onControlEdit.bind(this);
    this.onSourcesEdit = this.onSourcesEdit.bind(this);
    this.onTracksEdit = this.onTracksEdit.bind(this);
    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onCaptionEdit = this.onCaptionEdit.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    return false;
  }

  onTitleEdit(content: ContentState) {
    const titleContent = this.props.model.titleContent.with({ content });
    this.props.onEdit(this.props.model.with({ titleContent }));
  }

  onCaptionEdit(content: ContentState) {
    const caption = this.props.model.caption.with({ content });
    this.props.onEdit(this.props.model.with({ caption }));
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


  renderTracks() {

    const { tracks } = this.props.model;
    
    return (
      <div style={ { marginTop: '5px' } }>
        
        <Tracks
          {...this.props}
          mediaType="audio"
          accept="audio/*"
          model={tracks}
          onEdit={this.onTracksEdit}
        />
        
      </div>
    );
  }

  renderOther() {
    const { titleContent, caption, cite, popout, alternate } = this.props.model;
    
    return (
      <div style={ { marginTop: '30px' } }>
        
          {this.row('Title', '8', <RichTextEditor showLabel={false} label=""
          {...this.props}
          model={titleContent.content}
          editMode={this.props.editMode}
          onEdit={this.onTitleEdit}
          />)}

          <br/>

          {this.row('Caption', '8', <RichTextEditor showLabel={false} label=""
          {...this.props}
          model={caption.content}
          editMode={this.props.editMode}
          onEdit={this.onCaptionEdit}
          />)}

          <br/>

          {this.row('Popout', '8', <TextInput width="100%" label="" 
              editMode={this.props.editMode}
              value={popout.content} 
              type="text"
              onEdit={this.onPopoutEdit}
            />)}
        
      </div>
    );
  }

  row(text: string, width: string, control: any) {
    const widthClass = 'col-' + width;
    return (
      <div className="row justify-content-start">
        <label style={{ display: 'block', width: '100px', textAlign: 'right' }}
          className="col-1 col-form-label">{text}</label>
        <div className={widthClass}>
          {control}
        </div>
      </div>
    );
  }

  renderSources() {
    
    const { sources } = this.props.model;
    
    return (
      <div style={ { marginTop: '5px' } }>
        
        <Sources
          {...this.props}
          mediaType="audio"
          accept="audio/*"
          model={sources}
          onEdit={this.onSourcesEdit}
        />
        
      </div>
    );
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
    
        <br/>
    
        <TabContainer labels={['Sources', 'Tracks', 'Other']}>
          {this.renderSources()}
          {this.renderTracks()}
          {this.renderOther()}          
        </TabContainer>
    
      </div>
    );

  }

}

