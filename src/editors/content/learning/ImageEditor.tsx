import * as React from 'react';
import { Image } from '../../../data/content/learning/image';
import { AbstractContentEditor, AbstractContentEditorProps } from
  '../common/AbstractContentEditor';
import { TextInput } from '../common/TextInput';
import { injectSheet } from 'styles/jss';
import { Select } from '../common/Select';
import { StyledComponentProps } from 'types/component';
import { MediaManager } from 'editors/content/media/manager/MediaManager.controller';
import { MIMETYPE_FILTERS, SELECTION_TYPES } from 'editors/content/media/manager/MediaManager';
import { MediaItem } from 'types/media';
import { adjustPath } from 'editors/content/media/utils';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup, SidebarRow } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS, getContentIcon, insertableContentTypes } from
  'editors/content/utils/content';
import { buildUrl } from 'utils/path';
import { fetchImageSize, ImageSize } from 'utils/image';
import ModalSelection from 'utils/selection/ModalSelection';
import { modalActions } from 'actions/modal';
import { MediaMetadataEditor } from 'editors/content/learning/MediaItems';
import { AppContext } from 'editors/common/AppContext';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { AppServices } from 'editors/common/AppServices';

const IMAGE = require('../../../../assets/400x300.png');

import { styles } from './MediaElement.styles';
import { CaptionTextEditor } from './contiguoustext/CaptionTextEditor';

export interface ImageSizeSidebarProps {
  services: AppServices;
  editMode: boolean;
  model: Image;
  onEdit: (model: Image, source?: Object) => void;
  context: AppContext;
}

export interface ImageSizeSidebarState {
  size: ImageSize;
  aspectRatio: number;
  isNativeSize: boolean;
  isProportionConstrained: boolean;
  isSizeReceived: boolean;
}

export class ImageSizeSidebar extends
  React.PureComponent<ImageSizeSidebarProps, ImageSizeSidebarState> {
  constructor(props) {
    super(props);

    this.state = {
      aspectRatio: 1,
      size: {
        width: 0,
        height: 0,
      },
      isNativeSize:
        this.props.model.height === '' &&
        this.props.model.width === '',
      isProportionConstrained: false,
      isSizeReceived: false,
    };

    this.onSelect = this.onSelect.bind(this);
    this.onEditWidth = this.onEditWidth.bind(this);
    this.onEditHeight = this.onEditHeight.bind(this);
    this.onToggleNativeSizing = this.onToggleNativeSizing.bind(this);

  }

  componentDidMount() {
    this.setImageSize();
  }

  setImageSize() {
    fetchImageSize(this.props.model.src, this.props.context)
      .then(size => this.setState({
        aspectRatio: size.width / size.height,
        size,
        isProportionConstrained: true,
        isSizeReceived: true,
      }))
      .catch(err => this.setState({ isNativeSize: true }));
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

          // Whenever new image is selected, reset sizing to defaults
          this.onToggleNativeSizing(true);
          this.setState({
            isSizeReceived: false,
          });
          this.setImageSize();
        }
      });
  }

  onEditWidth(width) {
    const height = this.state.isProportionConstrained
      ? Math.round(width / this.state.aspectRatio).toString()
      : this.props.model.height;

    const model = this.props.model.with({ width, height });
    this.props.onEdit(model, model);
  }

  onEditHeight(height) {
    const width = this.state.isProportionConstrained
      ? Math.round(height * this.state.aspectRatio).toString()
      : this.props.model.width;

    const model = this.props.model.with({ width, height });
    this.props.onEdit(model, model);
  }

  onToggleProportionContrained(isProportionConstrained: boolean) {
    this.setState({
      isProportionConstrained,
    });
  }

  // This function maintains the user's custom size settings when toggling
  // between native and custom sizing.
  onToggleNativeSizing(isNativeSize) {
    this.setState({ isNativeSize });

    if (isNativeSize) {
      // Save the model's width and height in state and clear the model's width and height
      this.setState({
        size: {
          width: parseInt(this.props.model.width, 10),
          height: parseInt(this.props.model.height, 10),
        },
      });

      const model = this.props.model.with({ width: '', height: '' });
      this.props.onEdit(model, model);

    } else {
      // Custom size, so update the model with the size stored in state if it exists
      if (this.state.size.width !== 0 &&
        this.state.size.height !== 0) {
        const model = this.props.model.with({
          width: this.state.size.width.toString(),
          height: this.state.size.height.toString(),
        });
        this.props.onEdit(model, model);
      }
    }
  }

  render() {
    const { editMode } = this.props;
    const { width, height } = this.props.model;

    return (
      <div>
        <SidebarGroup label="">
          <ToolbarButton onClick={this.onSelect} size={ToolbarButtonSize.Large}>
            <div>{getContentIcon(insertableContentTypes.Image)}</div>
            <div>Change Image</div>
          </ToolbarButton>
        </SidebarGroup>
        <SidebarGroup label="Size">
          <SidebarRow>
            <div className="form-check">
              <label className="form-check-label">
                <input className="form-check-input"
                  name="sizingOptions"
                  value="native"
                  checked={this.state.isNativeSize}
                  onChange={() => this.onToggleNativeSizing(true)}
                  type="radio" />&nbsp; Default
            </label>
            </div>
            <div className="form-check">
              <label className="form-check-label">
                <input className="form-check-input"
                  name="sizingOptions"
                  onChange={() => this.onToggleNativeSizing(false)}
                  value="custom"
                  checked={!this.state.isNativeSize}
                  type="radio" />&nbsp; Custom
            </label>
            </div>
          </SidebarRow>
          <SidebarRow label="Width">
            <div className="input-group input-group-sm mb-3">
              <TextInput
                type="number"
                label="Enter width"
                editMode={editMode && !this.state.isNativeSize}
                value={width}
                onEdit={this.onEditWidth} />
              <div className="input-group-append">
                <span className="input-group-text" id="basic-addon2">pixels</span>
              </div>
            </div>
          </SidebarRow>
          <SidebarRow label="Height">
            <div className="input-group input-group-sm mb-3">
              <TextInput
                type="number"
                label="Enter height"
                editMode={editMode && !this.state.isNativeSize}
                value={height}
                onEdit={this.onEditHeight} />
              <div className="input-group-append">
                <span className="input-group-text" id="basic-addon2">pixels</span>
              </div>
            </div>
          </SidebarRow>
          <SidebarRow>
            <ToggleSwitch
              editMode={this.props.editMode &&
                this.state.isSizeReceived &&
                !this.state.isNativeSize}
              checked={this.state.isProportionConstrained}
              onClick={() =>
                this.onToggleProportionContrained(!this.state.isProportionConstrained)}
              label="Maintain Aspect Ratio" />
          </SidebarRow>
        </SidebarGroup>
      </div>
    );
  }
}

export interface ImageEditorProps extends AbstractContentEditorProps<Image> {
  onShowSidebar: () => void;
}

export interface ImageEditorState {
  failure: boolean;
}

export function selectImage(model, resourcePath, courseModel, display, dismiss): Promise<Image> {

  return new Promise((resolve, reject) => {

    const selected = { img: null };

    const mediaLibrary =
      <ModalSelection title="Select an image"
        onInsert={() => { dismiss(); resolve(selected.img); }}
        onCancel={() => dismiss()}>
        <MediaManager model={model ? model : new Image()}
          resourcePath={resourcePath}
          courseModel={courseModel}
          onEdit={() => { }}
          mimeFilter={MIMETYPE_FILTERS.IMAGE}
          selectionType={SELECTION_TYPES.SINGLE}
          initialSelectionPaths={[model ? model.src : null]}
          onSelectionChange={(img) => {
            selected.img =
              new Image().with({ src: adjustPath(img[0].pathTo, resourcePath) });
          }} />
      </ModalSelection>;

    display(mediaLibrary);
  });
}

@injectSheet(styles)
export default class ImageEditor
  extends AbstractContentEditor
  <Image, StyledComponentProps<ImageEditorProps>, ImageEditorState> {

  constructor(props) {
    super(props);

    this.onEditAlt = this.onEditAlt.bind(this);
    this.onEditValign = this.onEditValign.bind(this);
    this.onSourceSelectionChange = this.onSourceSelectionChange.bind(this);
    this.onCaptionEdit = this.onCaptionEdit.bind(this);
    this.state = {
      failure: false,
    };
  }
  onEditAlt(alt) {
    const model = this.props.model.with({ alt });
    this.props.onEdit(model, model);
  }
  onEditValign(valign) {
    const model = this.props.model.with({ valign });
    this.props.onEdit(model, model);
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

  onCaptionEdit(content, src) {
    const caption = this.props.model.caption.with({ content });
    const model = this.props.model.with({ caption });
    this.props.onEdit(model, src);
  }

  renderOther() {
    const { alt, valign } = this.props.model;

    return (
      <div>
        <SidebarGroup label="Align">
          <Select label="" editMode={this.props.editMode}
            value={valign} onChange={this.onEditValign}>
            <option value="top">Top</option>
            <option value="middle">Middle</option>
            <option value="baseline">Baseline</option>
            <option value="bottom">Bottom</option>
          </Select>
        </SidebarGroup>

        <SidebarGroup label="Alt">
          <TextInput width="100%" label=""
            editMode={this.props.editMode}
            value={alt}
            type="text"
            onEdit={this.onEditAlt} />
        </SidebarGroup>

        <MediaMetadataEditor
          {...this.props}
          model={this.props.model}
          onEdit={this.props.onEdit} />
      </div>
    );
  }

  renderSidebar() {

    return (
      <SidebarContent title="Image">
        <ImageSizeSidebar
          services={this.props.services}
          editMode={this.props.editMode}
          model={this.props.model}
          context={this.props.context}
          onEdit={this.props.onEdit} />
        {this.renderOther()}
      </SidebarContent>
    );
  }

  renderToolbar(): JSX.Element {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Image" columns={3} highlightColor={CONTENT_COLORS.Image}>
        <ToolbarLayout.Column>
          {/* <ToolbarButton onClick={onShowSidebar} size={ToolbarButtonSize.Wide}>
            <i className="fa fa-expand"/> Sizing
          </ToolbarButton> */}
          <ToolbarButton onClick={onShowSidebar} size={ToolbarButtonSize.Large}>
            <div><i className="fas fa-sliders-h" /></div>
            <div>Details</div>
          </ToolbarButton>
        </ToolbarLayout.Column>
      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {
    const {
      classes, editMode, activeContentGuid, context, parent, services, onFocus, hover,
      onUpdateHover, model,
    } = this.props;
    const { src, height, width } = model;

    let fullSrc;
    if (src === undefined || src === null || src === '') {
      fullSrc = IMAGE;
    } else {
      fullSrc = buildUrl(
        this.props.context.baseUrl,
        this.props.context.courseId,
        this.props.context.resourcePath,
        src);
    }

    return (
      <div className={classes.mediaElement}>
        <img src={fullSrc} height={height} width={width} />

        <CaptionTextEditor
          editMode={editMode}
          activeContentGuid={activeContentGuid}
          context={context}
          parent={parent}
          services={services}
          onFocus={onFocus}
          hover={hover}
          onUpdateHover={onUpdateHover}
          onEdit={this.onCaptionEdit}
          model={model.caption.content} />
      </div>
    );
  }
}
