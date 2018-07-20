import * as React from 'react';
import * as Immutable from 'immutable';
import { Audio } from 'data/content/learning/audio';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { MediaManager } from 'editors/content/media/manager/MediaManager.controller';
import { MIMETYPE_FILTERS, SELECTION_TYPES } from 'editors/content/media/manager/MediaManager';
import { adjustPath } from 'editors/content/media/utils';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { modalActions } from 'actions/modal';
import ModalSelection from 'utils/selection/ModalSelection';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { buildUrl } from 'utils/path';
import { MediaMetadataEditor } from 'editors/content/learning/MediaItems';
import { Source } from 'data/content/learning/source';

export interface AudioEditorProps extends AbstractContentEditorProps<Audio> {
  onShowSidebar: () => void;
}

export interface AudioEditorState {

}

export function selectAudio(
  model, resourcePath, courseModel, display, dismiss): Promise<Audio> {

  return new Promise((resolve, reject) => {

    const selected = { audio: null };

    const mediaLibrary =
      <ModalSelection title="Select an Audio File"
        onInsert={() => { dismiss(); resolve(selected.audio); }}
        onCancel={() => dismiss()}>
        <MediaManager model={model ? model : new Audio()}
          resourcePath={resourcePath}
          courseModel={courseModel}
          onEdit={() => { }}
          mimeFilter={MIMETYPE_FILTERS.AUDIO}
          selectionType={SELECTION_TYPES.SINGLE}
          initialSelectionPaths={[model ? model.sources.first().src : model]}
          onSelectionChange={(audio) => {
            const source = new Source({
              src: adjustPath(audio[0].pathTo, resourcePath),
            });
            const sources = Immutable.OrderedMap<string, Source>().set(source.guid, source);
            selected.audio = new Audio().with({ sources });
          }} />
      </ModalSelection>;

    display(mediaLibrary);
  });
}

export default class AudioEditor
  extends AbstractContentEditor<Audio, AudioEditorProps, AudioEditorState> {

  constructor(props) {
    super(props);

    this.onPopoutEdit = this.onPopoutEdit.bind(this);
    this.onControlEdit = this.onControlEdit.bind(this);
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

  onSelect() {
    const { context, services, onEdit, model } = this.props;

    const dispatch = (services as any).dispatch;
    const dismiss = () => dispatch(modalActions.dismiss());
    const display = c => dispatch(modalActions.display(c));

    selectAudio(model, context.resourcePath, context.courseModel, display, dismiss)
      .then((audio) => {
        if (audio !== null) {
          const source = new Source({ src: audio.sources.first().src });
          const model = this.props.model.with({
            sources:
              Immutable.OrderedMap<string, Source>().set(source.guid, source),
          });
          onEdit(model, model);
        }
      });
  }

  renderSidebar(): JSX.Element {
    return (
      <SidebarContent title="Audio">
        <SidebarGroup label="Controls">
          <ToggleSwitch
            checked={this.props.model.controls}
            onClick={this.onControlEdit}
            label="Display audio controls" />
        </SidebarGroup>
        <MediaMetadataEditor
          {...this.props}
          model={this.props.model}
          onEdit={this.props.onEdit} />
      </SidebarContent>
    );
  }

  renderToolbar(): JSX.Element {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Image" highlightColor={CONTENT_COLORS.Audio} columns={5}>
        <ToolbarLayout.Column>
          <ToolbarButton onClick={this.onSelect.bind(this)} size={ToolbarButtonSize.Large}>
            <div><i className="fa fa-volume-up" /></div>
            <div>Change Audio</div>
          </ToolbarButton>
        </ToolbarLayout.Column>

        <ToolbarLayout.Column>
          <ToolbarButton onClick={onShowSidebar} size={ToolbarButtonSize.Large}>
            <div><i className="fa fa-sliders" /></div>
            <div>Details</div>
          </ToolbarButton>
        </ToolbarLayout.Column>
      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {

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
        <audio src={fullSrc} controls={controls} />
      </div>
    );
  }
}
