import * as React from 'react';
import { IFrame } from 'data/content/learning/iframe';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { TextInput } from 'editors/content/common/TextInput';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS, insertableContentTypes, getContentIcon } from
  'editors/content/utils/content';
import { MediaMetadataEditor, MediaWidthHeightEditor } from 'editors/content/learning/MediaItems';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup, SidebarRow } from 'components/sidebar/ContextAwareSidebar';
import { buildUrl } from 'utils/path';
import {
  Discoverable, DiscoverableId,
} from 'components/common/Discoverable.controller';
import { modalActions } from 'actions/modal';
import { MediaManager, MIMETYPE_FILTERS, SELECTION_TYPES } from '../media/manager/MediaManager.controller';
import ModalSelection from 'utils/selection/ModalSelection';
import { adjustPath } from '../media/utils';

const IFRAME_PERMISSIONS = 'allow-forms allow-scripts';

export function selectMedia(
  model: IFrame, resourcePath, courseModel, display, dismiss): Promise<IFrame> {

  return new Promise((resolve, reject) => {

    let changed = model;
    const mediaLibrary =
      <ModalSelection title="Select an HTML page"
        onInsert={() => { dismiss(); resolve(changed); }}
        onCancel={() => dismiss()}>
        <MediaManager
          model={model}
          resourcePath={resourcePath}
          courseModel={courseModel}
          onEdit={() => { }}
          mimeFilter={MIMETYPE_FILTERS.ALL}
          selectionType={SELECTION_TYPES.SINGLE}
          initialSelectionPaths={[model ? model.src : null]}
          onSelectionChange={(sel) => {
            changed = model.with({
              src: adjustPath(sel[0].pathTo, resourcePath),
            });
          }} />
      </ModalSelection>;

    display(mediaLibrary);
  });
}

export interface IFrameEditorProps extends AbstractContentEditorProps<IFrame> {
  onShowSidebar: () => void;
  onDiscover: (id: DiscoverableId) => void;
}

export interface IFrameEditorState {

}

export default class IFrameEditor
  extends AbstractContentEditor<IFrame, IFrameEditorProps, IFrameEditorState> {

  constructor(props) {
    super(props);

    this.onSrcEdit = this.onSrcEdit.bind(this);
  }

  onSrcEdit(src: string) {
    const model = this.props.model.with({ src });
    this.props.onEdit(model, model);
  }

  onSelectMedia = () => {
    const { context, services, onEdit, model } = this.props;

    const dispatch = (services as any).dispatch;
    const dismiss = () => dispatch(modalActions.dismiss());
    const display = c => dispatch(modalActions.display(c));

    selectMedia(
      model,
      context.resourcePath, context.courseModel,
      display, dismiss)
      .then((updated) => {
        if (updated !== null) {
          onEdit(updated, updated);
        }
      });
  }

  renderSidebar() {
    return (
      <SidebarContent title="Web Page">

        <SidebarGroup label="URL">
          <SidebarRow>
            <Discoverable id={DiscoverableId.IFrameEditorWebpageURL} focusChild>
              <TextInput
                editMode={this.props.editMode}
                width="100%"
                type="text"
                label="Enter a URL https://"
                value={this.props.model.src}
                onEdit={this.onSrcEdit} />
            </Discoverable>
          </SidebarRow>
          <SidebarRow>
            <ToolbarButton onClick={this.onSelectMedia} size={ToolbarButtonSize.Large}>
              <div><i className="fa fa-file-code" /></div>
              <div>Select HTML</div>
            </ToolbarButton>
          </SidebarRow>
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

        <MediaMetadataEditor
          {...this.props}
          model={this.props.model}
          onEdit={this.props.onEdit} />

      </SidebarContent>
    );
  }

  renderToolbar() {
    const { onShowSidebar, onDiscover } = this.props;

    return (
      <ToolbarGroup
        label="Web Page"
        highlightColor={CONTENT_COLORS.IFrame}
        columns={6}>
        <ToolbarButton
          onClick={() => {
            onShowSidebar();
            onDiscover(DiscoverableId.IFrameEditorWebpageURL);
          }} size={ToolbarButtonSize.Large}>
          <div>{getContentIcon(insertableContentTypes.IFrame)}</div>
          <div>Web Page URL</div>
        </ToolbarButton>
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

    const { src, height, width } = this.props.model;
    const fullSrc = buildUrl(
      this.props.context.baseUrl,
      this.props.context.courseModel.guid,
      this.props.context.resourcePath,
      src);

    return (
      <div className="iframeEditor">
        <iframe src={fullSrc} height={height} width={width} sandbox={IFRAME_PERMISSIONS} />
      </div>
    );
  }
}
