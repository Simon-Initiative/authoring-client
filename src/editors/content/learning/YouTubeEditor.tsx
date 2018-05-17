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
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { MediaMetadataEditor, MediaWidthHeightEditor } from 'editors/content/learning/MediaItems';
import {
  Discoverable, DiscoverableId,
} from 'components/common/Discoverable.controller';

import { getQueryVariableFromString } from 'utils/params';
import './YouTube.scss';

export interface YouTubeProps extends AbstractContentEditorProps<YouTubeType> {
  onShowSidebar: () => void;
  onDiscover: (id: DiscoverableId) => void;
}

export interface YouTubeState {

}

export default class YouTubeEditor
  extends AbstractContentEditor<YouTubeType, YouTubeProps, YouTubeState> {

  constructor(props) {
    super(props);

    this.onSrcEdit = this.onSrcEdit.bind(this);
    this.onCaptionEdit = this.onCaptionEdit.bind(this);
    this.onControlEdit = this.onControlEdit.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.model !== this.props.model;
  }

  onSrcEdit(src: string) {
    let videoSrc;

    const hasParams = src.includes('?');
    if (hasParams) {
      const queryString = src.substr(src.indexOf('?') + 1);
      videoSrc = getQueryVariableFromString('v', queryString);
    }
    const model = this.props.model.with({
      src: videoSrc ? videoSrc : src,
    });
    this.props.onEdit(model, model);
  }

  onCaptionEdit(content: ContentElements, src) {
    const caption = this.props.model.caption.with({ content });
    this.props.onEdit(this.props.model.with({ caption }), src);
  }


  onControlEdit() {
    const controls = !this.props.model.controls;
    const model = this.props.model.with({ controls });
    this.props.onEdit(model, model);
  }

  renderSidebar(): JSX.Element {
    const { src } = this.props.model;

    return (
      <SidebarContent title="YouTube">
        <SidebarGroup label="Video URL">
          <Discoverable id={DiscoverableId.YouTubeEditorSourceURL} focusChild="input">
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
          </Discoverable>
        </SidebarGroup>
        <SidebarGroup label="Controls">
          <ToggleSwitch
            checked={this.props.model.controls}
            onClick={this.onControlEdit}
            labelBefore="Display YouTube controls" />
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
  renderToolbar(): JSX.Element {
    const { onShowSidebar, onDiscover } = this.props;

    return (
      <ToolbarGroup
        label="YouTube"
        columns={6}
        highlightColor={CONTENT_COLORS.YouTube}>
        <ToolbarButton
          onClick={() => {
            onShowSidebar();
            onDiscover(DiscoverableId.YouTubeEditorSourceURL);
          }} size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-youtube-play" /></div>
          <div>Source URL</div>
        </ToolbarButton>
        <ToolbarLayout.Column>
          <ToolbarButton onClick={() => window.open('https://youtube.com', '_blank').focus()}
            size={ToolbarButtonSize.Large}>
            <i className="fa fa-youtube" /> YouTube.com
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
        <iframe src={fullSrc} height={height} width={width} />
      </div>
    );
  }
}
