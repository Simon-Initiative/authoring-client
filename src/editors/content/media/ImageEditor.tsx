import * as React from 'react';
import * as persistence from '../../../data/persistence';
import { Image } from '../../../data/content/learning/image';
import { TextContent } from 'data/content/common/text';
import { InlineContent } from 'data/content/common/inline';
import { ContentContainer } from '../container/ContentContainer';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { LabeledType } from '../labeled/LabeledEditor';
import { RichTextEditor } from '../common/RichTextEditor';
import { TextInput } from '../common/TextInput';
import { Select } from '../common/Select';
import { TabContainer } from '../common/TabContainer';
import { MediaManager } from './manager/MediaManager.controller';
import { MIMETYPE_FILTERS, SELECTION_TYPES } from './manager/MediaManager';
import { MediaItem } from 'types/media';
import { adjustPath } from './utils';

export interface ImageEditorProps extends AbstractContentEditorProps<Image> {

}

export interface ImageEditorState {
  failure: boolean;
  isDefaultSizing: boolean;
}


/**
 * The content editor for Table.
 */
export class ImageEditor
  extends AbstractContentEditor<Image, ImageEditorProps, ImageEditorState> {

  constructor(props) {
    super(props);

    this.onLabeledEdit = this.onLabeledEdit.bind(this);
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
    if (nextProps.model !== this.props.model) {
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
    const { context, onEdit } = this.props;

    if (selection[0]) {
      onEdit(this.props.model.with({ src: adjustPath(selection[0].pathTo, context.resourcePath) }));
    }
  }

  onLabeledEdit(model: LabeledType) {

    const { titleContent, cite, caption } = model;
    const updated = this.props.model.with({ titleContent, cite, caption });

    this.props.onEdit(updated);
  }

  onPopoutEdit(content: string) {
    const popout = this.props.model.popout.with({ content });
    this.props.onEdit(this.props.model.with({ popout }));
  }

  onAlternateEdit(content: TextContent) {
    const alternate = this.props.model.alternate.with({ content });
    this.props.onEdit(this.props.model.with({ alternate }));
  }

  onTitleEdit(text: TextContent) {
    const titleContent = this.props.model.titleContent.with({ text });
    this.props.onEdit(this.props.model.with({ titleContent }));
  }

  onCaptionEdit(content: InlineContent) {
    const caption = this.props.model.caption.with({ content });
    this.props.onEdit(this.props.model.with({ caption }));
  }

  onSetClick() {
    // TODO
  }

  row(text: string, width: string, control: any) {
    const widthClass = 'col-' + width;
    return (
      <div className="row justify-content-start">
        <label style={{ display: 'block', width: '100px', textAlign: 'right' }}
          className="col-1 col-form-label">{text}</label>
        <div className={widthClass}>
          {control}
        </div>
      </div>
    );
  }

  renderSource() {
    const { context, model, onEdit } = this.props;

    return (
      <MediaManager context={context} model={model}
        onEdit={onEdit} mimeFilter={MIMETYPE_FILTERS.IMAGE}
        selectionType={SELECTION_TYPES.SINGLE}
        initialSelectionPaths={[model.src]}
        onSelectionChange={this.onSourceSelectionChange} />
    );
  }

  changeSizing(isDefaultSizing) {
    this.setState({ isDefaultSizing });

    if (isDefaultSizing) {
      this.props.onEdit(this.props.model.with({ width: '', height: '' }));
    }
  }

  renderSizing() {
    const { width, height } = this.props.model;

    return (
      <div style={ { marginTop: '70px', marginLeft: '75px' } }>

        <div className="form-check">
          <label className="form-check-label">
            <input className="form-check-input"
              name="sizingOptions"
              value="native"
              defaultChecked={this.state.isDefaultSizing}
              onChange={this.changeSizing.bind(this, true)}
              type="radio"/>&nbsp;
              Display the image at the image's native width and height
          </label>
        </div>
        <br/>
        <div className="form-check" style={ { marginBottom: '30px' } }>
          <label className="form-check-label">
            <input className="form-check-input"
              name="sizingOptions"
              onChange={this.changeSizing.bind(this, false)}
              value="custom"
              defaultChecked={!this.state.isDefaultSizing}
              type="radio"/>&nbsp;
              Display the image at a custom width and height
          </label>
        </div>

        {this.row('Height', '1', <div className="input-group input-group-sm">
            <TextInput width="100px" label=""
            editMode={this.props.editMode && !this.state.isDefaultSizing}
            value={height}
            type="number"
            onEdit={this.onHeightEdit}
          /><span className="input-group-addon ">pixels</span></div>)}
        {this.row('Width', '1', <div className="input-group input-group-sm">
           <TextInput width="100px" label=""
            editMode={this.props.editMode && !this.state.isDefaultSizing}
            value={width}
            type="number"
            onEdit={this.onWidthEdit}
          /><span className="input-group-addon" id="basic-addon2">pixels</span></div>)}

      </div>
    );
  }

  renderOther() {
    const { titleContent, caption, popout, alt, valign } = this.props.model;

    return (
      <div style={ { marginTop: '30px' } }>

        {this.row('Align', '4', <Select label="" editMode={this.props.editMode}
              value={valign} onChange={this.onValignEdit}>
              <option value="top">Top</option>
              <option value="middle">Middle</option>
              <option value="baseline">Baseline</option>
              <option value="bottom">Bottom</option>
            </Select>)}

          {this.row('Alt', '8', <TextInput width="100%" label=""
              editMode={this.props.editMode}
              value={alt}
              type="text"
              onEdit={this.onAltEdit}
            />)}

          {this.row('Popout', '8', <TextInput width="100%" label=""
              editMode={this.props.editMode}
              value={popout.content}
              type="text"
              onEdit={this.onPopoutEdit}
            />)}

          {this.row('Title', '8', <ContentContainer
            {...this.props}
            model={titleContent.text}
            editMode={this.props.editMode}
            onEdit={this.onTitleEdit}
          />)}

          {this.row('Caption', '8', <ContentContainer
          {...this.props}
          model={caption.content}
          editMode={this.props.editMode}
          onEdit={this.onCaptionEdit}
          />)}

      </div>
    );
  }

  render() : JSX.Element {

    return (
      <div className="itemWrapper">

        <TabContainer labels={['Source', 'Sizing', 'Other']}>
          {this.renderSource()}
          {this.renderSizing()}
          {this.renderOther()}
        </TabContainer>

      </div>);
  }

}

