import * as React from 'react';

import { YouTube as YouTubeType } from '../../../data/content/learning/youtube';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { ContentElements } from 'data/content/common/elements';
import { TextInput } from '../common/TextInput';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup, SidebarRow } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { MediaMetadata, MediaWidthHeight } from 'editors/content/learning/MediaItems';
import './YouTube.scss';

export interface YouTubeProps extends AbstractContentEditorProps<YouTubeType> {
  onShowSidebar: () => void;
}

export interface YouTubeState {

}

export class YouTubeEditor
  extends AbstractContentEditor<YouTubeType, YouTubeProps, YouTubeState> {

  constructor(props) {
    super(props);

    this.onSrcEdit = this.onSrcEdit.bind(this);
    this.onCaptionEdit = this.onCaptionEdit.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.model !== this.props.model;
  }

  onSrcEdit(src: string) {
    const model = this.props.model.with({ src });
    this.props.onEdit(model, model);
  }

  onCaptionEdit(content: ContentElements, src) {
    const caption = this.props.model.caption.with({ content });
    this.props.onEdit(this.props.model.with({ caption }), src);
  }

  renderSidebar(): JSX.Element {
    const { src } = this.props.model;

    return (
      <SidebarContent title="YouTube">
        <SidebarGroup label="">
          <SidebarRow label="">
            <div className="input-group">
              <span className="input-group-addon sourceAddon">youtube.com/watch?v=</span>
                <TextInput
                  {...this.props}
                  width="100%"
                  type="text"
                  label=""
                  value={src}
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
  renderToolbar(): JSX.Element {
    return (
      <ToolbarGroup
        label="YouTube"
        columns={5}
        highlightColor={CONTENT_COLORS.YouTube}>
        <ToolbarButton onClick={() => this.props.onShowSidebar()} size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-youtube-play"/></div>
          <div>Source URL</div>
        </ToolbarButton>
        <ToolbarLayout.Column>
          <ToolbarButton onClick={() => window.open('https://youtube.com', '_blank').focus()}
            size={ToolbarButtonSize.Wide}>
            <i className="fa fa-youtube"/> YouTube.com
          </ToolbarButton>
        </ToolbarLayout.Column>
      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {
    const { src, height, width } = this.props.model;
    const fullSrc = 'https://www.youtube.com/embed/'
      + (src === '' ? 'zHIIzcWqsP0' : src);

    return (
      <div className="youtubeEditor">
        <iframe src={fullSrc} height={height} width={width}/>
      </div>
    );
  }
}
