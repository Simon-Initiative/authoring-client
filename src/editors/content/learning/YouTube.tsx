import * as React from 'react';

import { YouTube as YouTubeType } from '../../../data/content/learning/youtube';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { ContentElements } from 'data/content/common/elements';
import { TextInput } from '../common/TextInput';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import './YouTube.scss';

export interface YouTubeProps extends AbstractContentEditorProps<YouTubeType> {
  onShowSidebar: () => void;
}

export interface YouTubeState {

}

export const SidebarRow = (text: string, width: string, control: any) => {
  const widthClass = `col-${width}`;
  return (
    <div className="form-group row">
      {text !== ''
        ? <label className="col-3 col-form-label">{text}</label>
        : null}
      <div className={widthClass}>
        {control}
      </div>
    </div>
  );
};

export class YouTube
  extends AbstractContentEditor<YouTubeType, YouTubeProps, YouTubeState> {

  constructor(props) {
    super(props);

    this.onSrcEdit = this.onSrcEdit.bind(this);
    this.onHeightEdit = this.onHeightEdit.bind(this);
    this.onWidthEdit = this.onWidthEdit.bind(this);
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

  onHeightEdit(height: string) {
    const model = this.props.model.with({ height });
    this.props.onEdit(model, model);
  }

  onWidthEdit(width: string) {
    const model = this.props.model.with({ width });
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
        {SidebarRow('', '12', <div className="input-group">
            <span className="input-group-addon sourceAddon">youtube.com/watch?v=</span>
              <TextInput
                {...this.props}
                width="100%"
                type="text"
                label=""
                value={src}
                onEdit={this.onSrcEdit} />
          </div>)}
        </SidebarGroup>

        {SidebarRow('Height', '9', <div className="input-group input-group-sm">
            <TextInput width="100%" label=""
            editMode={this.props.editMode}
            value={height}
            type="number"
            onEdit={this.onHeightEdit}
          /><span className="input-group-addon ">pixels</span></div>)}

        {SidebarRow('Width', '9', <div className="input-group input-group-sm">
           <TextInput width="100%" label=""
            editMode={this.props.editMode}
            value={width}
            type="number"
            onEdit={this.onWidthEdit}
          /><span className="input-group-addon" id="basic-addon2">pixels</span></div>)}

          {SidebarRow('Popout', '9', <TextInput width="100%" label=""
              editMode={this.props.editMode}
              value={popout.content}
              type="text"
              onEdit={this.onPopoutEdit}
            />)}

          {/* {SidebarRow('Title', '9', <ContentContainer
            {...this.props}
            model={titleContent.text}
            editMode={this.props.editMode}
            onEdit={this.onTitleEdit}
          />)}

          {SidebarRow('Caption', '9', <ContentContainer
          {...this.props}
          model={caption.content}
          editMode={this.props.editMode}
          onEdit={this.onCaptionEdit}
          />)} */}
      </SidebarContent>
    );
  }
  renderToolbar(): JSX.Element {
    return (
      <ToolbarGroup
        label="YouTube"
        highlightColor={CONTENT_COLORS.YouTube}>
        <ToolbarButton onClick={() => this.props.onShowSidebar()} size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-file-code-o"/></div>
          <div>Language</div>
        </ToolbarButton>
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
