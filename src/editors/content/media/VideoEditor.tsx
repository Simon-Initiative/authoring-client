import * as React from 'react';
import { OrderedMap } from 'immutable';
import { Video } from 'data/content/learning/video';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { MediaManager } from 'editors/content/media/manager/MediaManager.controller';
import { MIMETYPE_FILTERS, SELECTION_TYPES } from 'editors/content/media/manager/MediaManager';
import { adjustPath } from 'editors/content/media/utils';
import { SidebarRow, SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { MediaMetadata, MediaWidthHeight } from 'editors/content/learning/MediaItems';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { buildUrl } from 'utils/path';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import ModalSelection from 'utils/selection/ModalSelection';
import { Source } from 'data/content/learning/source';

export interface VideoEditorProps extends AbstractContentEditorProps<Video> {
  onShowSidebar: () => void;
}

export interface VideoEditorState {

}

export function selectVideo(
  model, resourcePath, courseModel, display, dismiss) : Promise<Video> {

  return new Promise((resolve, reject) => {

    const selected = { video: null };

    const mediaLibrary =
      <ModalSelection title="Select a Video File"
        onInsert={() => { dismiss(); resolve(selected.video); }}
        onCancel={() => dismiss()}>
        <MediaManager model={model ? model : new Video()}
          resourcePath={resourcePath}
          courseModel={courseModel}
          onEdit={() => {}}
          mimeFilter={MIMETYPE_FILTERS.VIDEO}
          selectionType={SELECTION_TYPES.SINGLE}
          initialSelectionPaths={[model ? model.sources.first().src : model]}
          onSelectionChange={(video) => {
            const source = new Source({
              src: adjustPath(video[0].pathTo, resourcePath),
            });
            const sources = OrderedMap<string, Source>().set(source.guid, source);
            selected.video = new Video().with({ sources });
          }} />
      </ModalSelection>;

    display(mediaLibrary);
  });
}

export class VideoEditor
  extends AbstractContentEditor<Video, VideoEditorProps, VideoEditorState> {

  constructor(props) {
    super(props);

    this.onTypeEdit = this.onTypeEdit.bind(this);
    this.onControlEdit = this.onControlEdit.bind(this);
  }

  onTypeEdit(type: string) {
    const model = this.props.model.with({ type });
    this.props.onEdit(model, model);
  }

  onControlEdit() {
    const controls = !this.props.model.controls;
    const model = this.props.model.with({ controls });
    this.props.onEdit(model, model);
  }

  renderSidebar() {
    return (
      <SidebarContent title="Video">
        <SidebarGroup label="">
          <SidebarRow heading="">
            <ToggleSwitch
              checked={this.props.model.controls}
              onClick={this.onControlEdit}
              labelBefore="Display video controls" />
          </SidebarRow>

        <MediaWidthHeight
            width={this.props.model.width}
            height={this.props.model.height}
            editMode={this.props.editMode}
            onEditWidth={(width) => {
              const model = this.props.model.with({ width });
              this.props.onEdit(model, model);
            }}
            onEditHeight={(height) => {
              const model = this.props.model.with({ height });
              this.props.onEdit(model, model);
            }} />

        <MediaMetadata
          {...this.props}
          model={this.props.model}
          onEdit={this.props.onEdit} />
        </SidebarGroup>
      </SidebarContent>
    );
  }
  renderToolbar() {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Video" highlightColor={CONTENT_COLORS.Video}>
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

    const { sources, controls, width, height } = this.props.model;

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
      <div className="videoEditor">
        <video width={width} height={height} src={fullSrc} controls={controls}/>
      </div>
    );
  }
}
