import * as React from 'react';
import * as Immutable from 'immutable';
import { ContentElements } from 'data/content/common/elements';
import { ContentContainer } from '../container/ContentContainer';
import { Audio } from '../../../data/content/learning/audio';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { Tracks } from './Tracks';
import { RichTextEditor } from '../common/RichTextEditor';
import { TextInput } from '../common/TextInput';
import { TabContainer } from '../common/TabContainer';
import { ContiguousText } from 'data/content/learning/contiguous';

import { MediaManager } from './manager/MediaManager.controller';
import { MIMETYPE_FILTERS, SELECTION_TYPES } from './manager/MediaManager';
import { MediaItem } from 'types/media';
import { Source } from 'data/content/learning/source';
import { adjustPath } from './utils';

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

    this.onPopoutEdit = this.onPopoutEdit.bind(this);
    this.onAlternateEdit = this.onAlternateEdit.bind(this);
    this.onControlEdit = this.onControlEdit.bind(this);
    this.onTracksEdit = this.onTracksEdit.bind(this);
    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onCaptionEdit = this.onCaptionEdit.bind(this);
    this.onSourceSelectionChange = this.onSourceSelectionChange.bind(this);
    this.renderSources = this.renderSources.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    return false;
  }

  onTitleEdit(text: ContentElements) {
    const titleContent = this.props.model.titleContent.with({
      text,
    });
    this.props.onEdit(this.props.model.with({ titleContent }));
  }

  onCaptionEdit(content: ContentElements) {
    const caption = this.props.model.caption.with({ content });
    this.props.onEdit(this.props.model.with({ caption }));
  }

  onPopoutEdit(content: string) {
    const popout = this.props.model.popout.with({ content });
    this.props.onEdit(this.props.model.with({ popout }));
  }

  onAlternateEdit(content: ContentElements) {
    const alternate = this.props.model.alternate.with({ content });
    this.props.onEdit(this.props.model.with({ alternate }));
  }

  onControlEdit(e) {
    const controls = e.checked;
    this.props.onEdit(this.props.model.with({ controls }));
  }

  onTracksEdit(tracks) {
    this.props.onEdit(this.props.model.with({ tracks }));
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
    const { titleContent, caption, popout } = this.props.model;

    return (
      <div style={ { marginTop: '30px' } }>

          {this.row('', '8', <label className="form-check-label">
            &nbsp;&nbsp;&nbsp;
            <input type="checkbox"
              onClick={this.onControlEdit}
              className="form-check-input"
              checked={this.props.model.controls}
              value="option1"/>&nbsp;&nbsp;
            Display audio controls
          </label>)}

          <br/>


          {this.row('Title', '8', <ContentContainer
            {...this.props}
            model={titleContent.text}
            editMode={this.props.editMode}
            onEdit={this.onTitleEdit}
          />)}

          <br/>

          {this.row('Caption', '8', <ContentContainer
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

  onSourceSelectionChange(selections: MediaItem[]) {
    const { model, context, onEdit } = this.props;

    if (selections.length > 0) {
      const source = new Source({ src: adjustPath(selections[0].pathTo, context.resourcePath) });

      onEdit(model.with({
        sources: Immutable.OrderedMap<string, Source>().set(source.guid, source),
      }));
    }
  }

  renderSources() {
    const { context, model, onEdit } = this.props;

    return (
      <MediaManager context={context} model={model}
        onEdit={onEdit} mimeFilter={MIMETYPE_FILTERS.AUDIO}
        selectionType={SELECTION_TYPES.SINGLE}
        initialSelectionPaths={model.sources.map(s => s.src).toArray()}
        onSelectionChange={this.onSourceSelectionChange} />
    );

  }


  renderSidebar() {
    return null;
  }
  renderToolbar() {
    return null;
  }

  renderMain() : JSX.Element {

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

