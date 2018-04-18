import * as React from 'react';
import { IFrame } from '../../../data/content/learning/iframe';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { TextInput } from '../common/TextInput';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { MediaMetadataEditor, MediaWidthHeightEditor } from 'editors/content/learning/MediaItems';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { buildUrl } from 'utils/path';
import {
  Discoverable, FocusAction, DiscoverableId,
} from 'components/common/Discoverable.controller';


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

  renderSidebar() {
    return (
      <SidebarContent title="Web Page">

        <SidebarGroup label="URL">
          <Discoverable id={DiscoverableId.IFrameEditorWebpageURL} focusChild>
            <TextInput
              {...this.props}
              width="100%"
              type="text"
              label=""
              value={this.props.model.src}
              onEdit={this.onSrcEdit} />
          </Discoverable>
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
        columns={4}>
        <ToolbarButton
          onClick={() => {
            onShowSidebar();
            onDiscover(DiscoverableId.IFrameEditorWebpageURL);
          }} size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-window-maximize"/></div>
          <div>Web Page URL</div>
        </ToolbarButton>
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

    const { src, height, width } = this.props.model;
    const fullSrc = buildUrl(
      this.props.context.baseUrl,
      this.props.context.courseId,
      this.props.context.resourcePath,
      src);

    return (
      <div className="iframeEditor">
        <iframe src={fullSrc} height={height} width={width}/>
      </div>
    );
  }
}
