import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { SidebarGroup, SidebarRow } from 'components/sidebar/ContextAwareSidebar';
import { TextInput } from '../common/TextInput';
import { ImageParams } from 'data/content/learning/image';
import { AppletParams } from 'data/content/learning/applet';
import { FlashParams } from 'data/content/learning/flash';
import { DirectorParams } from 'data/content/learning/director';
import { PanoptoParams } from 'data/content/learning/panopto';
import { MathematicaParams } from 'data/content/learning/mathematica';
import { UnityParams } from 'data/content/learning/unity';
import { AudioParams } from 'data/content/learning/audio';
import { VideoParams } from 'data/content/learning/video';
import { YouTubeParams } from 'data/content/learning/youtube';
import { IFrameParams } from 'data/content/learning/iframe';
import { ContentElements } from 'data/content/common/elements';
import { ContentContainer } from '../container/ContentContainer';
import { AppContext } from 'editors/common/AppContext';
import { AppServices } from 'editors/common/AppServices';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { ToolbarContentContainer } from '../container/ToolbarContentContainer';

export type MediaType = {
  with: (options: ImageParams
    | AppletParams | FlashParams | DirectorParams | PanoptoParams
    | MathematicaParams | UnityParams
    | VideoParams | YouTubeParams | IFrameParams | AudioParams) =>
    contentTypes.MediaItem;
  popout: contentTypes.Popout;
  alternate: contentTypes.Alternate;
  titleContent: contentTypes.Title;
  caption: contentTypes.Caption;
  cite: contentTypes.Cite;
};

export interface MediaWidthHeightEditorProps {
  width: string;
  height: string;
  editMode: boolean;
  onEditWidth: (width: string) => void;
  onEditHeight: (height: string) => void;
}

export interface MediaWidthHeightEditorState {

}

export class MediaWidthHeightEditor extends React.PureComponent
  <MediaWidthHeightEditorProps, MediaWidthHeightEditorState> {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SidebarGroup label="Size">
        <SidebarRow label="Width">
          <div className="input-group input-group-sm">
            <TextInput width="100%" label=""
              editMode={this.props.editMode}
              value={this.props.width}
              type="number"
              onEdit={this.props.onEditWidth} />
            <span className="input-group-addon ">pixels</span>
          </div>
        </SidebarRow>
        <SidebarRow label="Height">
          <div className="input-group input-group-sm">
            <TextInput width="100%" label=""
              editMode={this.props.editMode}
              value={this.props.height}
              type="number"
              onEdit={this.props.onEditHeight} />
            <span className="input-group-addon " id="basic-addon2">pixels</span>
          </div>
        </SidebarRow>
      </SidebarGroup>
    );
  }
}

export interface MediaMetadataEditorProps {
  editMode: boolean;
  model: contentTypes.MediaItem;
  onEdit: (model: contentTypes.MediaItem, source?: Object) => void;
  onFocus: (model, parent, textSelection) => void;
  context: AppContext;
  services: AppServices;
}

export interface MediaMetadataEditorState {

}

export class MediaMetadataEditor
  extends React.PureComponent<MediaMetadataEditorProps, MediaMetadataEditorState> {
  constructor(props) {
    super(props);

    this.onPopoutEdit = this.onPopoutEdit.bind(this);
    this.onPopoutEnableToggle = this.onPopoutEnableToggle.bind(this);
    // this.onAlternateEdit = this.onAlternateEdit.bind(this);
    this.onTitleEdit = this.onTitleEdit.bind(this);
    // this.onCitationTitleEdit = this.onCitationTitleEdit.bind(this);
    // this.onCitationEntryEdit = this.onCitationEntryEdit.bind(this);
    // this.onCitationContentEdit = this.onCitationContentEdit.bind(this);
  }

  onPopoutEdit(content: string) {
    const popout = this.props.model.popout.with({ content });
    const model: contentTypes.MediaItem = (this.props.model as MediaType).with({ popout });
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
    const model: contentTypes.MediaItem = (this.props.model as MediaType).with({ titleContent });
    this.props.onEdit(model, model);
  }

  // onCitationTitleEdit(title: string) {
  //   const cite = this.props.model.cite.with({ title });
  //   const model = (this.props.model as MediaType).with({ cite });
  //   this.props.onEdit(model, model);
  // }

  // onCitationEntryEdit(entry: string) {
  //   const cite = this.props.model.cite.with({ entry });
  //   const model = (this.props.model as MediaType).with({ cite });
  //   this.props.onEdit(model, model);
  // }

  // onCitationContentEdit(content: ContentElements, src) {
  //   const cite = this.props.model.cite.with({ content });
  //   const model = (this.props.model as MediaType).with({ cite });
  //   this.props.onEdit(model, src);
  // }

  render() {
    const { popout, titleContent } = this.props.model;

    return (
      <div>
        <SidebarGroup label="Title">
          <ContentContainer
            {...this.props}
            renderContext={undefined}
            activeContentGuid={null}
            hover={null}
            onUpdateHover={() => { }}
            model={titleContent.text}
            onEdit={this.onTitleEdit} />
        </SidebarGroup>
        <SidebarGroup label="Popout">
          <SidebarRow>
            <ToggleSwitch
              checked={popout.enable}
              onClick={this.onPopoutEnableToggle}
              label="Enabled" />
          </SidebarRow>
          <SidebarRow>
            <TextInput width="100%" label="Content"
              editMode={this.props.editMode}
              value={popout.content}
              type="text"
              onEdit={this.onPopoutEdit} />
          </SidebarRow>
        </SidebarGroup>
        {/* Leaving alternate out for now */}
        {/* <SidebarGroup label="Alternate">
          <ContentContainer
            {...this.props}
            model={alternate.content}
            onEdit={this.onAlternateEdit} />
        </SidebarGroup> */}
        {/* <SidebarGroup label="Citation">
          <TextInput width="100%" label="Title"
            editMode={this.props.editMode}
            value={cite.title}
            type="text"
            onEdit={this.onCitationTitleEdit} />
          <TextInput width="100%" label="Entry"
            editMode={this.props.editMode}
            value={cite.entry}
            type="text"
            onEdit={this.onCitationEntryEdit} />
          <ContentContainer
            {...this.props}
            renderContext={undefined}
            activeContentGuid={null}
            hover={null}
            onUpdateHover={() => { }}
            model={cite.content}
            onEdit={this.onCitationContentEdit} />
        </SidebarGroup> */}
      </div>
    );
  }
}
