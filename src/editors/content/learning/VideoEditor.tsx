import * as React from 'react';
import { OrderedMap } from 'immutable';
import { Video } from 'data/content/learning/video';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { MediaManager } from 'editors/content/media/manager/MediaManager.controller';
import { MIMETYPE_FILTERS, SELECTION_TYPES } from 'editors/content/media/manager/MediaManager';
import { adjustPath } from 'editors/content/media/utils';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { MediaMetadataEditor, MediaWidthHeightEditor } from 'editors/content/learning/MediaItems';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { buildUrl } from 'utils/path';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import ModalSelection from 'utils/selection/ModalSelection';
import { Source } from 'data/content/learning/source';
import { modalActions } from 'actions/modal';
import { selectImage } from 'editors/content/learning/ImageEditor';
import { ContentElements } from 'data/content/common/elements';
import { determineMimeTypeFromFilename } from 'utils/mime';
import { ModalMessage } from 'utils/ModalMessage';

import './Media.scss';
import { ContentContainer } from 'editors/content/container/ContentContainer';

export interface VideoEditorProps extends AbstractContentEditorProps<Video> {
  onShowSidebar: () => void;
}

export interface VideoEditorState {

}

export function selectVideo(
  model, resourcePath, courseModel, display, dismiss): Promise<Video> {

  return new Promise((resolve, reject) => {

    const selected = { video: null };

    const displayMimeTypeError = () => {
      // Display an error message letting the user know that
      // since the mime type couldn't be determined, we cannot
      // use this video
      const message = (
        <ModalMessage onCancel={() => dismiss()}>
          <b>Unable to use this video</b><br /><br />
          We could not determine the MIME type based on this file's extension.
        </ModalMessage>
      );

      display(message);
    };

    const mediaLibrary =
      <ModalSelection title="Select a Video File"
        onInsert={() => {
          dismiss();
          selected.video === false
            ? displayMimeTypeError() : resolve(selected.video);
        }
        }
        onCancel={() => dismiss()}>
        <MediaManager model={model ? model : new Video()}
          resourcePath={resourcePath}
          courseModel={courseModel}
          onEdit={() => { }}
          mimeFilter={MIMETYPE_FILTERS.VIDEO}
          selectionType={SELECTION_TYPES.SINGLE}
          initialSelectionPaths={[model ? model.sources.first().src : model]}
          onSelectionChange={(video) => {

            // Only allow saving of the selected video if we can determine
            // the mime type based on the filename.
            try {

              const type = determineMimeTypeFromFilename(video[0].pathTo);
              const source = new Source({
                src: adjustPath(video[0].pathTo, resourcePath),
                type,
              });
              const sources = OrderedMap<string, Source>().set(source.guid, source);
              selected.video = new Video().with({ sources, type });

              // To test out the display of the mime type error, uncomment the following:
              // throw new Error('Test');

            } catch (e) {
              selected.video = false;
            }


          }} />
      </ModalSelection>;

    display(mediaLibrary);
  });
}

export default class VideoEditor
  extends AbstractContentEditor<Video, VideoEditorProps, VideoEditorState> {

  constructor(props) {
    super(props);

    this.onTypeEdit = this.onTypeEdit.bind(this);
    this.onControlEdit = this.onControlEdit.bind(this);
    this.onSelectPoster = this.onSelectPoster.bind(this);
    this.onCaptionEdit = this.onCaptionEdit.bind(this);
  }

  onCaptionEdit(content: ContentElements, src) {
    const caption = this.props.model.caption.with({ content });
    this.props.onEdit(this.props.model.with({ caption }), src);
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

  onSelectPoster() {
    const { context, services, onEdit, model } = this.props;

    const dispatch = (services as any).dispatch;
    const dismiss = () => dispatch(modalActions.dismiss());
    const display = c => dispatch(modalActions.display(c));

    selectImage(
      model,
      context.resourcePath, context.courseModel,
      display, dismiss)
      .then((poster) => {
        if (poster !== null) {
          const updated = model.with({ poster: poster.src });
          onEdit(updated, updated);
        }
      });
  }

  renderSidebar() {

    const posterSrc = this.props.model.poster;
    const poster = posterSrc !== ''
      ? posterSrc.substr(posterSrc.lastIndexOf('/') + 1)
      : 'No poster selected';

    return (
      <SidebarContent title="Video">
        <SidebarGroup label="Controls">
          <ToggleSwitch
            checked={this.props.model.controls}
            onClick={this.onControlEdit}
            label="Display video controls" />
        </SidebarGroup>

        <MediaWidthHeightEditor
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

        <SidebarGroup label="Poster">
          <div>{poster}</div>
          <ToolbarButton onClick={this.onSelectPoster} size={ToolbarButtonSize.Large}>
            <div><i className="fa fa-image" /></div>
            <div>Change Image</div>
          </ToolbarButton>
        </SidebarGroup>

        <MediaMetadataEditor
          {...this.props}
          model={this.props.model}
          onEdit={this.props.onEdit} />
      </SidebarContent>
    );
  }

  renderToolbar() {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Video" highlightColor={CONTENT_COLORS.Video} columns={3}>
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
        <video width={width} height={height} src={fullSrc} controls={controls} />
        <div className="captionEditor">
          <div className="captionHeader">Caption</div>
          <ContentContainer
            {...this.props}
            onEdit={this.onCaptionEdit}
            model={this.props.model.caption.content} />
        </div>
      </div>
    );
  }
}
