import * as React from 'react';

import { YouTube as YouTubeType } from '../../../data/content/learning/youtube';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { ContentElements } from 'data/content/common/elements';
import { TextInput } from '../common/TextInput';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { SidebarRow, MediaMetadata, MediaWidthHeight } from './Media';
import './YouTube.scss';

export interface YouTubeProps extends AbstractContentEditorProps<YouTubeType> {
  onShowSidebar: () => void;
}

export interface YouTubeState {

}

export class YouTube
  extends AbstractContentEditor<YouTubeType, YouTubeProps, YouTubeState> {

  constructor(props) {
    super(props);

    this.onSrcEdit = this.onSrcEdit.bind(this);
    this.onPopoutEdit = this.onPopoutEdit.bind(this);
    this.onAlternateEdit = this.onAlternateEdit.bind(this);
    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onCaptionEdit = this.onCaptionEdit.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.model !== this.props.model;
  }

  onPopoutEdit(content: string) {
    const popout = this.props.model.popout.with({ content });
    const model = this.props.model.with({ popout });
    this.props.onEdit(model, model);
  }

  onAlternateEdit(content: ContentElements) {
    const alternate = this.props.model.alternate.with({ content });
    const model = this.props.model.with({ alternate });
    this.props.onEdit(model, model);
  }

  onSrcEdit(src: string) {
    const model = this.props.model.with({ src });
    this.props.onEdit(model, model);
  }

  onTitleEdit(text: ContentElements) {
    const titleContent = this.props.model.titleContent.with({ text });
    this.props.onEdit(this.props.model.with({ titleContent }));
  }

  onCaptionEdit(content: ContentElements) {
    const caption = this.props.model.caption.with({ content });
    this.props.onEdit(this.props.model.with({ caption }));
  }

  renderSidebar(): JSX.Element {
    const { popout, src, height, width } = this.props.model;
    // titleContent, caption,
    return (
      <SidebarContent title="YouTube">
        <SidebarGroup label="">
          <SidebarRow text="" width="12">
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
            model={this.props.model}
            editMode={this.props.editMode}
            onEdit={this.props.onEdit} />

          {/*
          <SidebarRow text="Title" width="9">
            <ContentContainer
              {...this.props}
              model={titleContent.text}
              editMode={this.props.editMode}
              onEdit={this.onTitleEdit}/>
          </SidebarRow>
          <SidebarRow text="Caption" width="9">
            <ContentContainer
              {...this.props}
              model={caption.content}
              editMode={this.props.editMode}
              onEdit={this.onCaptionEdit} />
          </SidebarRow>
          */}

        </SidebarGroup>
      </SidebarContent>
    );
  }
  renderToolbar(): JSX.Element {
    return (
      <ToolbarGroup
        label="YouTube"
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
