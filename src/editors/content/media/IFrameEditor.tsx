import * as React from 'react';
import { IFrame } from '../../../data/content/learning/iframe';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { TextInput } from '../common/TextInput';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { MediaMetadata, MediaWidthHeight } from 'editors/content/learning/MediaItems';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup, SidebarRow } from 'components/sidebar/ContextAwareSidebar';
import { buildUrl } from 'utils/path';


export interface IFrameEditorProps extends AbstractContentEditorProps<IFrame> {
  onShowSidebar: () => void;
}

export interface IFrameEditorState {

}

export class IFrameEditor
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
      <SidebarContent title="IFrame">
        <SidebarGroup label="">
          <SidebarRow text="" width="12">
            <div className="input-group">
              <TextInput
                {...this.props}
                width="100%"
                type="text"
                label=""
                value={this.props.model.src}
                onEdit={this.onSrcEdit} />
            </div>
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
    return (
      <ToolbarGroup
        label="YouTube"
        highlightColor={CONTENT_COLORS.IFrame}>
        <ToolbarButton onClick={this.props.onShowSidebar} size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-html5"/></div>
          <div>Source URL</div>
        </ToolbarButton>
        <ToolbarLayout.Column>
          <ToolbarButton onClick={this.props.onShowSidebar} size={ToolbarButtonSize.Large}>
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
