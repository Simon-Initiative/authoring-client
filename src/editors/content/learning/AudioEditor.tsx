import * as React from 'react';
import * as Immutable from 'immutable';
import { Audio as AudioType } from 'data/content/learning/audio';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { Tracks } from 'editors/content/media/Tracks';
import { MediaManager } from 'editors/content/media/manager/MediaManager.controller';
import { MIMETYPE_FILTERS, SELECTION_TYPES } from 'editors/content/media/manager/MediaManager';
import { adjustPath } from 'editors/content/media/utils';
import { SidebarRow, SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { modalActions } from 'actions/modal';
import ModalSelection from 'utils/selection/ModalSelection';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { buildUrl } from 'utils/path';
import { Track } from 'data/content/learning/track';
import { MediaMetadata } from 'editors/content/learning/MediaItems';

export interface AudioEditorProps extends AbstractContentEditorProps<AudioType> {
  onShowSidebar: () => void;
}

export interface AudioEditorState {

}

export function selectAudio(
  model, resourcePath, courseModel, display, dismiss) : Promise<AudioType> {

  return new Promise((resolve, reject) => {

    const selected = { audio: null };

    const mediaLibrary =
      <ModalSelection title="Select an Audio File"
        onInsert={() => { dismiss(); resolve(selected.audio); }}
        onCancel={() => dismiss()}
      >
        <MediaManager model={model ? model : new AudioType()}
          resourcePath={resourcePath}
          courseModel={courseModel}
          onEdit={() => {}}
          mimeFilter={MIMETYPE_FILTERS.AUDIO}
          selectionType={SELECTION_TYPES.SINGLE}
          initialSelectionPaths={[model ? model.src : model]}
          onSelectionChange={(audio) => {
            selected.audio =
              new AudioType().with({ src: adjustPath(audio[0].pathTo, resourcePath) });
          }} />
      </ModalSelection>;

    display(mediaLibrary);
  });

}

export class AudioEditor
  extends AbstractContentEditor<AudioType, AudioEditorProps, AudioEditorState> {

  constructor(props) {
    super(props);

    this.onPopoutEdit = this.onPopoutEdit.bind(this);
    this.onControlEdit = this.onControlEdit.bind(this);
    this.onTracksEdit = this.onTracksEdit.bind(this);
  }

  onPopoutEdit(content: string) {
    const popout = this.props.model.popout.with({ content });
    const model = this.props.model.with({ popout });
    this.props.onEdit(model, model);
  }

  onControlEdit() {
    const controls = !this.props.model.controls;
    const model = this.props.model.with({ controls });
    this.props.onEdit(model, model);
  }

  onTracksEdit(tracks: Immutable.OrderedMap<string, Track>, src) {
    const model = this.props.model.with({ tracks });
    this.props.onEdit(model, src);
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

  onSelect() {
    const { context, services, onEdit, model } = this.props;

    const dispatch = (services as any).dispatch;
    const dismiss = () => dispatch(modalActions.dismiss());
    const display = c => dispatch(modalActions.display(c));

    selectAudio(
      model,
      context.resourcePath,
      context.courseModel,
      display,
      dismiss)
      .then((audio) => {
        if (audio !== null) {
          const updated = model.with({ src: audio.src });
          onEdit(updated, updated);
        }
      });
  }


  renderSidebar(): JSX.Element {
    return (
      <SidebarContent title="Audio">
        <SidebarGroup label="">

          <SidebarRow text="" width="12">
            <ToggleSwitch
              checked={this.props.model.controls}
              onClick={this.onControlEdit}
              labelBefore="Display audio controls" />
          </SidebarRow>

          <MediaMetadata
            {...this.props}
            model={this.props.model}
            onEdit={this.props.onEdit} />

        </SidebarGroup>
      </SidebarContent>
    );
  }
  renderToolbar(): JSX.Element {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Image" highlightColor={CONTENT_COLORS.Audio}>
        <ToolbarLayout.Column>
          <ToolbarButton onClick={this.onSelect.bind(this)} size={ToolbarButtonSize.Large}>
            <div><i className="fa fa-volume-up"/></div>
            <div>Change Audio</div>
          </ToolbarButton>
        </ToolbarLayout.Column>

        <ToolbarLayout.Column>
          <ToolbarButton onClick={onShowSidebar} size={ToolbarButtonSize.Large}>
            <div><i className="fa fa-sliders"/></div>
            <div>Details</div>
          </ToolbarButton>
        </ToolbarLayout.Column>
      </ToolbarGroup>
    );
  }

  renderMain() : JSX.Element {

    const { sources, controls } = this.props.model;

    let fullSrc = '';
    if (sources.size > 0) {
      const src = sources.first().src;
      fullSrc = buildUrl(
      this.props.context.baseUrl,
      this.props.context.courseId,
      this.props.context.resourcePath,
      src);
    }

    return (
      <div className="audioEditor">
        <audio src={fullSrc} controls={controls}/>
        {this.renderTracks()}
      </div>
    );
  }
}
