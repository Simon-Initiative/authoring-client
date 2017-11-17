import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';

import { ContentState } from 'draft-js';

import { Video }  from '../../../data/content/html/video';
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

    this.onSetClick = this.onSetClick.bind(this);
    this.onPopoutEdit = this.onPopoutEdit.bind(this);
    this.onAlternateEdit = this.onAlternateEdit.bind(this);
    this.onTypeEdit = this.onTypeEdit.bind(this);
    this.onControlEdit = this.onControlEdit.bind(this);
    this.onSourcesEdit = this.onSourcesEdit.bind(this);
    this.onTracksEdit = this.onTracksEdit.bind(this);
    this.onHeightEdit = this.onHeightEdit.bind(this);
    this.onWidthEdit = this.onWidthEdit.bind(this);
    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onCaptionEdit = this.onCaptionEdit.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    return false;
  }

  onPopoutEdit(content: ContentState) {
    const popout = this.props.model.popout.with({ content });
    this.props.onEdit(this.props.model.with({ popout }));
  }


  onTitleEdit(content: ContentState) {
    const titleContent = this.props.model.titleContent.with({ content });
    this.props.onEdit(this.props.model.with({ titleContent }));
  }

  onCaptionEdit(content: ContentState) {
    const caption = this.props.model.caption.with({ content });
    this.props.onEdit(this.props.model.with({ caption }));
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

  onSourcesEdit(sources) {
    this.props.onEdit(this.props.model.with({ sources }));
  }

  onTracksEdit(tracks) {
    this.props.onEdit(this.props.model.with({ tracks }));
  }

  onHeightEdit(height: string) {
    this.props.onEdit(this.props.model.with({ height }));
  }

  onWidthEdit(width: string) {
    this.props.onEdit(this.props.model.with({ width }));
  }

  renderTracks() {

    const { tracks } = this.props.model;

    return (
      <div style={ { marginTop: '5px' } }>

        <Tracks
          {...this.props}
          mediaType="video"
          accept="video/*"
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

          {this.row('', '8', <label className="form-check-label">
            &nbsp;&nbsp;&nbsp;
            <input type="checkbox"
              onClick={this.onControlEdit}
              className="form-check-input"
              checked={this.props.model.controls}
              value="option1"/>&nbsp;&nbsp;
            Display video controls
          </label>)}

          <br/>


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


  renderSizing() {
    const { titleContent, caption, cite, popout, alternate,
      width, height } = this.props.model;

    return (
      <div style={ { marginTop: '70px', marginLeft: '75px' } }>

        {this.row('Height', '1', <div className="input-group input-group-sm">
            <TextInput width="100px" label=""
            editMode={this.props.editMode}
            value={height}
            type="number"
            onEdit={this.onHeightEdit}
          /><span className="input-group-addon ">pixels</span></div>)}
        {this.row('Width', '1', <div className="input-group input-group-sm">
            <TextInput width="100px" label=""
            editMode={this.props.editMode}
            value={width}
            type="number"
            onEdit={this.onWidthEdit}
          /><span className="input-group-addon" id="basic-addon2">pixels</span></div>)}

      </div>
    );
  }

  renderSources() {

    const { sources } = this.props.model;

    return (
      <div style={ { marginTop: '5px' } }>

        <Sources
          {...this.props}
          mediaType="video"
          accept="video/*"
          model={sources}
          onEdit={this.onSourcesEdit}
        />

      </div>
    );
  }


  render() : JSX.Element {

    return (
      <div className="itemWrapper">

        <br/>

        <TabContainer labels={['Sources', 'Tracks', 'Sizing', 'Other']}>
          {this.renderSources()}
          {this.renderTracks()}
          {this.renderSizing()}
          {this.renderOther()}
        </TabContainer>

      </div>
    );

  }

}

