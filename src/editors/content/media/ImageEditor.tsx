import * as React from 'react';
import { Image } from '../../../data/content/learning/image';
import { ContentElements } from 'data/content/common/elements';
import { ContentContainer } from '../container/ContentContainer';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { TextInput } from '../common/TextInput';
import { injectSheet } from 'styles/jss';
import { Select } from '../common/Select';
import { StyledComponentProps } from 'types/component';
import { MediaManager } from './manager/MediaManager.controller';
import { MIMETYPE_FILTERS, SELECTION_TYPES } from './manager/MediaManager';
import { MediaItem } from 'types/media';
import { adjustPath } from './utils';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup, SidebarRow } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { Button } from 'editors/content/common/Button';
import { buildUrl } from 'utils/path';
import ModalSelection from 'utils/selection/ModalSelection';
import { modalActions } from 'actions/modal';
import { MediaMetadata } from 'editors/content/learning/MediaItems';

import styles from './MediaElement.style';


export interface ImageEditorProps extends AbstractContentEditorProps<Image> {
  onShowSidebar: () => void;
}

export interface ImageEditorState {
  failure: boolean;
  isDefaultSizing: boolean;
}

function selectImage(model, resourcePath, courseModel, display, dismiss) : Promise<Image> {

  return new Promise((resolve, reject) => {

    const selected = { img: null };

    const mediaLibrary =
      <ModalSelection title="Select an image"
        onInsert={() => { dismiss(); resolve(selected.img); }}
        onCancel={() => dismiss()}
      >
        <MediaManager model={model}
          resourcePath={resourcePath}
          courseModel={courseModel}
          onEdit={() => {}}
          mimeFilter={MIMETYPE_FILTERS.IMAGE}
          selectionType={SELECTION_TYPES.SINGLE}
          initialSelectionPaths={[model.src]}
          onSelectionChange={(img) => {
            selected.img =
              new Image().with({ src: adjustPath(img[0].pathTo, resourcePath) });
          }} />
      </ModalSelection>;

    display(mediaLibrary);
  });

}

/**
 * The content editor for Table.
 */
@injectSheet(styles)
export class ImageEditor
  extends AbstractContentEditor<Image, StyledComponentProps<ImageEditorProps>, ImageEditorState> {

  constructor(props) {
    super(props);

    this.onSelect = this.onSelect.bind(this);
    this.onSetClick = this.onSetClick.bind(this);
    this.onPopoutEdit = this.onPopoutEdit.bind(this);
    this.onAlternateEdit = this.onAlternateEdit.bind(this);
    this.onWidthEdit = this.onWidthEdit.bind(this);
    this.onHeightEdit = this.onHeightEdit.bind(this);
    this.onAltEdit = this.onAltEdit.bind(this);
    this.onValignEdit = this.onValignEdit.bind(this);
    this.onSourceSelectionChange = this.onSourceSelectionChange.bind(this);
    this.onCaptionEdit = this.onCaptionEdit.bind(this);
    this.onTitleEdit = this.onTitleEdit.bind(this);

    this.state = {
      failure: false,
      isDefaultSizing: this.props.model.height === '' && this.props.model.width === '',
    };
  }

  onWidthEdit(width) {
    this.props.onEdit(this.props.model.with({ width }));
  }
  onHeightEdit(height) {
    this.props.onEdit(this.props.model.with({ height }));
  }
  onAltEdit(alt) {
    this.props.onEdit(this.props.model.with({ alt }));
  }
  onValignEdit(valign) {
    this.props.onEdit(this.props.model.with({ valign }));
  }

  shouldComponentUpdate(nextProps, nextState: ImageEditorState) {

    if (nextProps.activeContentGuid !== this.props.activeContentGuid) {
      return true;
    }
    if (nextProps.model !== this.props.model) {
      return true;
    }
    if (nextProps.context !== this.props.context) {
      return true;
    }
    if (nextState.failure !== this.state.failure) {
      return true;
    }
    if (nextState.isDefaultSizing !== this.state.isDefaultSizing) {
      return true;
    }
    return false;
  }

  onSourceSelectionChange(selection: MediaItem[]) {
    const { context, onEdit, services } = this.props;
    services.dismissModal();

    if (selection[0]) {
      const updated = this.props.model.with(
        { src: adjustPath(selection[0].pathTo, context.resourcePath) });
      onEdit(updated, updated);
    }
  }

  onPopoutEdit(content: string) {
    const popout = this.props.model.popout.with({ content });
    this.props.onEdit(this.props.model.with({ popout }));
  }

  onAlternateEdit(content: ContentElements, src) {
    const alternate = this.props.model.alternate.with({ content });
    this.props.onEdit(this.props.model.with({ alternate }), src);
  }

  onTitleEdit(text: ContentElements, src) {
    const titleContent = this.props.model.titleContent.with({ text });
    this.props.onEdit(this.props.model.with({ titleContent }), src);
  }

  onCaptionEdit(content: ContentElements, src) {
    const caption = this.props.model.caption.with({ content });
    this.props.onEdit(this.props.model.with({ caption }), src);
  }

  onSetClick() {
    // TODO
  }

  renderSource() {

  }

  changeSizing(isDefaultSizing) {
    this.setState({ isDefaultSizing });

    if (isDefaultSizing) {
      const updated = this.props.model.with({ width: '', height: '' });
      this.props.onEdit(updated, updated);
    }
  }

  renderSizing() {
    const { width, height } = this.props.model;

    return (
      <div>

        <div className="form-check">
          <label className="form-check-label">
            <input className="form-check-input"
              name="sizingOptions"
              value="native"
              defaultChecked={this.state.isDefaultSizing}
              onChange={this.changeSizing.bind(this, true)}
              type="radio"/>&nbsp;
              Native
          </label>
        </div>
        <div className="form-check" style={ { marginBottom: '30px' } }>
          <label className="form-check-label">
            <input className="form-check-input"
              name="sizingOptions"
              onChange={this.changeSizing.bind(this, false)}
              value="custom"
              defaultChecked={!this.state.isDefaultSizing}
              type="radio"/>&nbsp;
              Custom
          </label>
        </div>

        <SidebarRow text="Width" width="9">
          <div className="input-group input-group-sm">
           <TextInput width="100px" label=""
            editMode={this.props.editMode && !this.state.isDefaultSizing}
            value={width}
            type="number"
            onEdit={this.onWidthEdit}
          /><span className="input-group-addon" id="basic-addon2">pixels</span></div>
        </SidebarRow>
        <SidebarRow text="Height" width="9">
          <div className="input-group input-group-sm">
            <TextInput width="100px" label=""
            editMode={this.props.editMode && !this.state.isDefaultSizing}
            value={height}
            type="number"
            onEdit={this.onHeightEdit} />
            <span className="input-group-addon ">pixels</span>
          </div>
        </SidebarRow>

      </div>
    );
  }

  renderOther() {
    const { titleContent, caption, popout, alt, valign } = this.props.model;

    return (
      <div style={ { marginTop: '30px' } }>

        <SidebarRow text="Align" width="6">
          <Select label="" editMode={this.props.editMode}
            value={valign} onChange={this.onValignEdit}>
            <option value="top">Top</option>
            <option value="middle">Middle</option>
            <option value="baseline">Baseline</option>
            <option value="bottom">Bottom</option>
          </Select>
        </SidebarRow>

        <SidebarRow text="Alt" width="9">
          <TextInput width="100%" label=""
            editMode={this.props.editMode}
            value={alt}
            type="text"
            onEdit={this.onAltEdit} />
        </SidebarRow>

        <MediaMetadata
          {...this.props}
          model={this.props.model}
          onEdit={this.props.onEdit} />

      </div>
    );
  }

  onSelect() {
    const { context, services, onEdit, model } = this.props;

    const dispatch = (services as any).dispatch;
    const dismiss = () => dispatch(modalActions.dismiss());
    const display = c => dispatch(modalActions.display(c));

    selectImage(
      model,
      context.resourcePath, context.courseModel,
      display, dismiss)
      .then((image) => {
        if (image !== null) {
          const updated = model.with({ src: image.src });
          onEdit(updated, updated);
        }
      });
  }

  renderSidebar() {
    return (
      <SidebarContent title="Image">
        <SidebarGroup label="">
          <Button
            editMode={this.props.editMode}
            onClick={this.onSelect}>Change Image</Button>
        </SidebarGroup>
        <br/>
        <SidebarGroup label="Sizing">
          {this.renderSizing()}
        </SidebarGroup>
        <SidebarGroup label="Other">
          {this.renderOther()}
        </SidebarGroup>
      </SidebarContent>
    );
  }
  renderToolbar(): JSX.Element {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Image" highlightColor={CONTENT_COLORS.Image}>
        <ToolbarLayout.Column>
          <ToolbarButton onClick={this.onSelect.bind(this)} size={ToolbarButtonSize.Large}>
            <div><i className="fa fa-image"/></div>
            <div>Change Image</div>
          </ToolbarButton>
        </ToolbarLayout.Column>

        <ToolbarLayout.Column>
          {/* <ToolbarButton onClick={onShowSidebar} size={ToolbarButtonSize.Wide}>
            <i className="fa fa-expand"/> Sizing
          </ToolbarButton> */}
          <ToolbarButton onClick={onShowSidebar} size={ToolbarButtonSize.Large}>
            <div><i className="fa fa-sliders"/></div>
            <div>Details</div>
          </ToolbarButton>
        </ToolbarLayout.Column>
      </ToolbarGroup>
    );
  }

  renderMain() : JSX.Element {

    const { classes, model } = this.props;
    const { src, height, width } = model;

    const fullSrc = buildUrl(
      this.props.context.baseUrl,
      this.props.context.courseId,
      this.props.context.resourcePath,
      src);

    return (
      <div className={classes.mediaElement}>
        <img src={fullSrc} height={height} width={width}/>
      </div>
    );
  }

}

