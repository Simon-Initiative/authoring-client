import * as React from 'react';
import * as Immutable from 'immutable';
import { Audio } from 'data/content/learning/audio';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { MediaManager } from 'editors/content/media/manager/MediaManager.controller';
import { MIMETYPE_FILTERS, SELECTION_TYPES } from 'editors/content/media/manager/MediaManager';
import { adjustPath } from 'editors/content/media/utils';
import { SidebarGroup, SidebarRow } from 'components/sidebar/ContextAwareSidebar';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS, getContentIcon, insertableContentTypes } from
  'editors/content/utils/content';
import { modalActions } from 'actions/modal';
import ModalSelection from 'utils/selection/ModalSelection';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { buildUrl } from 'utils/path';
import { MediaMetadataEditor } from 'editors/content/learning/MediaItems';
import { Source } from 'data/content/learning/source';
import { ContentElements } from 'data/content/common/elements';
import { determineMimeTypeFromFilename } from 'utils/mime';
import { ModalMessage } from 'utils/ModalMessage';

import './Media.scss';
import { CaptionTextEditor } from './contiguoustext/CaptionTextEditor';

export interface AudioEditorProps extends AbstractContentEditorProps<Audio> {
  onShowSidebar: () => void;
}

export interface AudioEditorState {

}

export function selectAudio(
  model, resourcePath, courseModel, display, dismiss): Promise<Audio> {

  return new Promise((resolve, reject) => {

    const selected = { audio: null };

    const displayMimeTypeError = () => {
      // Display an error message letting the user know that
      // since the mime type couldn't be determined, we cannot
      // use this audio file
      const message = (
        <ModalMessage onCancel={() => dismiss()}>
          <b>Unable to use this audio clip</b><br /><br />
          We could not determine the MIME type based on this file's extension.
        </ModalMessage>
      );

      display(message);
    };

    const mediaLibrary =
      <ModalSelection title="Select an Audio File"
        onInsert={() => {
          dismiss();
          selected.audio === false
            ? displayMimeTypeError() : resolve(selected.audio);
        }
        }
        onCancel={() => dismiss()}>
        <MediaManager model={model ? model : new Audio()}
          resourcePath={resourcePath}
          courseModel={courseModel}
          onEdit={() => { }}
          mimeFilter={MIMETYPE_FILTERS.AUDIO}
          selectionType={SELECTION_TYPES.SINGLE}
          initialSelectionPaths={[model ? model.sources.first().src : model]}
          onSelectionChange={(audio) => {

            // Only allow saving of the selected audio if we can determine
            // the mime type based on the filename.
            try {

              const type = determineMimeTypeFromFilename(audio[0].pathTo);
              const source = new Source({
                src: adjustPath(audio[0].pathTo, resourcePath),
                type,
              });
              const sources = Immutable.OrderedMap<string, Source>().set(source.guid, source);
              selected.audio = new Audio().with({ sources, type });

              // To test out the display of the mime type error, uncomment the following:
              // throw new Error('Test');

            } catch (e) {
              selected.audio = false;
            }

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
    this.onCaptionEdit = this.onCaptionEdit.bind(this);
  }

  onCaptionEdit(content: ContentElements, src) {
    const caption = this.props.model.caption.with({ content });
    this.props.onEdit(this.props.model.with({ caption }), src);
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
          <SidebarRow>
            <ToggleSwitch
              checked={this.props.model.controls}
              onClick={this.onControlEdit}
              label="Display audio controls" />
          </SidebarRow>
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
            <div>{getContentIcon(insertableContentTypes.Audio)}</div>
            <div>Change Audio</div>
          </ToolbarButton>
        </ToolbarLayout.Column>

        <ToolbarLayout.Column>
          <ToolbarButton onClick={onShowSidebar} size={ToolbarButtonSize.Large}>
            <div><i className="fas fa-sliders-h" /></div>
            <div>Details</div>
          </ToolbarButton>
        </ToolbarLayout.Column>
      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {
    const {
      editMode, activeContentGuid, context, parent, services, onFocus, hover,
      onUpdateHover, model,
    } = this.props;
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

        <CaptionTextEditor
          editMode={editMode}
          activeContentGuid={activeContentGuid}
          context={context}
          parent={parent}
          services={services}
          onFocus={onFocus}
          hover={hover}
          onUpdateHover={onUpdateHover}
          onEdit={this.onCaptionEdit}
          model={model.caption.content} />
      </div>
    );
  }
}
