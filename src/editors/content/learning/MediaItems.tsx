import * as React from 'react';
import { Popout } from 'data/content/learning/popout';
import { Alternate } from 'data/content/learning/alternate';
import { Title } from 'data/content/learning/title';
import { Caption } from 'data/content/learning/caption';
import { Cite } from 'data/content/learning/cite';
import { SidebarGroup, SidebarRow } from 'components/sidebar/ContextAwareSidebar';
import { TextInput } from '../common/TextInput';
import { MediaItem } from 'data/contentTypes';
import { ImageParams } from 'data/content/learning/image';
import { AudioParams } from 'data/content/learning/audio';
import { VideoParams } from 'data/content/learning/video';
import { YouTubeParams } from 'data/content/learning/youtube';
import { IFrameParams } from 'data/content/learning/iframe';
import { ContentElements } from 'data/content/common/elements';
import { ContentContainer } from '../container/ContentContainer';
import { AppContext } from 'editors/common/AppContext';
import { AppServices } from 'editors/common/AppServices';
import { ToggleSwitch } from 'components/common/ToggleSwitch';

export type MediaType = {
  with: (options: ImageParams | VideoParams | YouTubeParams | IFrameParams | AudioParams) =>
    MediaItem;
  popout: Popout;
  alternate: Alternate;
  titleContent: Title;
  caption: Caption;
  cite: Cite;
};

export interface MediaWidthHeightProps {
  width: string;
  height: string;
  editMode: boolean;
  onEditWidth: (width: string) => void;
  onEditHeight: (height: string) => void;
}

export interface MediaWidthHeightState {

}

export class MediaWidthHeight extends React.PureComponent
  <MediaWidthHeightProps, MediaWidthHeightState> {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <SidebarRow label="Width">
          <div className="input-group input-group-sm">
            <TextInput width="100%" label=""
              editMode={this.props.editMode}
              value={this.props.width}
              type="number"
              onEdit={this.props.onEditWidth}/>
            <span className="input-group-addon ">pixels</span>
          </div>
        </SidebarRow>
        <SidebarRow label="Height">
          <div className="input-group input-group-sm">
            <TextInput width="100%" label=""
              editMode={this.props.editMode}
              value={this.props.height}
              type="number"
              onEdit={this.props.onEditHeight}/>
            <span className="input-group-addon " id="basic-addon2">pixels</span>
          </div>
        </SidebarRow>
      </div>
    );
  }
}

export interface MediaMetadataProps {
  editMode: boolean;
  model: MediaItem;
  onEdit: (model: MediaItem, source?: Object) => void;
  onFocus: (model, parent, textSelection) => void;
  context: AppContext;
  services: AppServices;
}

export interface MediaMetadataState {

}

export class MediaMetadata extends React.PureComponent<MediaMetadataProps, MediaMetadataState> {
  constructor(props) {
    super(props);

    this.onPopoutEdit = this.onPopoutEdit.bind(this);
    this.onPopoutEnableToggle = this.onPopoutEnableToggle.bind(this);
    // this.onAlternateEdit = this.onAlternateEdit.bind(this);
    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onCaptionEdit = this.onCaptionEdit.bind(this);
    this.onCitationTitleEdit = this.onCitationTitleEdit.bind(this);
    this.onCitationEntryEdit = this.onCitationEntryEdit.bind(this);
    this.onCitationContentEdit = this.onCitationContentEdit.bind(this);
  }

  onPopoutEdit(content: string) {
    const popout = this.props.model.popout.with({ content });
    const model: MediaItem = (this.props.model as MediaType).with({ popout });
    this.props.onEdit(model, model);
  }

  onPopoutEnableToggle() {
    const popout = this.props.model.popout.with({
      enable: !this.props.model.popout.enable,
    });
    const model = (this.props.model as MediaType).with({ popout });
    this.props.onEdit(model, model);
  }

  // onAlternateEdit(content: ContentElements) {
  //   const alternate = this.props.model.alternate.with({ content });
  //   const model: MediaItem = (this.props.model as MediaType).with({ alternate });
  //   this.props.onEdit(model, model);
  // }

  onTitleEdit(text: ContentElements) {
    const titleContent = this.props.model.titleContent.with({ text });
    const model: MediaItem = (this.props.model as MediaType).with({ titleContent });
    this.props.onEdit(model, model);
  }

  onCaptionEdit(content: ContentElements, src) {
    const caption = this.props.model.caption.with({ content });
    const model = (this.props.model as MediaType).with({ caption });
    this.props.onEdit(model, src);
  }

  onCitationTitleEdit(title: string) {
    const cite = this.props.model.cite.with({ title });
    const model = (this.props.model as MediaType).with({ cite });
    this.props.onEdit(model, model);
  }

  onCitationEntryEdit(entry: string) {
    const cite = this.props.model.cite.with({ entry });
    const model = (this.props.model as MediaType).with({ cite });
    this.props.onEdit(model, model);
  }

  onCitationContentEdit(content: ContentElements, src) {
    const cite = this.props.model.cite.with({ content });
    const model = (this.props.model as MediaType).with({ cite });
    this.props.onEdit(model, src);
  }

  render() {
    const { popout, titleContent, caption, cite } = this.props.model;

    return (
      <div>
        <SidebarGroup label="">
          <SidebarRow label="Title">
            <ContentContainer
              {...this.props}
              renderContext={undefined}
              activeContentGuid={null}
              hover={null}
              onUpdateHover={() => {}}
              model={titleContent.text}
              onEdit={this.onTitleEdit} />
          </SidebarRow>
          <SidebarRow label="Popout">
            <ToggleSwitch
              {...this.props}
              checked={popout.enable}
              onClick={this.onPopoutEnableToggle}
              labelBefore="Enabled" />
            <TextInput width="100%" label="Content"
              editMode={this.props.editMode}
              value={popout.content}
              type="text"
              onEdit={this.onPopoutEdit}/>
          </SidebarRow>
          {/* Leaving alternate out for now */}
          {/* <SidebarRow text="Alternate" width="9">
            <ContentContainer
              {...this.props}
              model={alternate.content}
              onEdit={this.onAlternateEdit} />
          </SidebarRow> */}
          <SidebarRow label="Caption">
            <ContentContainer
              {...this.props}
              renderContext={undefined}
              activeContentGuid={null}
              hover={null}
              onUpdateHover={() => {}}
              model={caption.content}
              onEdit={this.onCaptionEdit} />
            </SidebarRow>
            <SidebarRow label="Citation">
              <TextInput width="100%" label="Title"
                editMode={this.props.editMode}
                value={cite.title}
                type="text"
                onEdit={this.onCitationTitleEdit}/>
              <TextInput width="100%" label="Entry"
                editMode={this.props.editMode}
                value={cite.entry}
                type="text"
                onEdit={this.onCitationEntryEdit}/>
              <ContentContainer
                {...this.props}
                renderContext={undefined}
                activeContentGuid={null}
                hover={null}
                onUpdateHover={() => {}}
                model={cite.content}
                onEdit={this.onCitationContentEdit} />
            </SidebarRow>
          </SidebarGroup>
      </div>
    );
  }
}
