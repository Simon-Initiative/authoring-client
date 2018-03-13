import * as React from 'react';
import { ContentElements } from 'data/content/common/elements';
import { IFrame } from '../../../data/content/learning/iframe';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { TextInput } from '../common/TextInput';
import { ContentContainer } from '../container/ContentContainer';

import { TabContainer } from '../common/TabContainer';

export interface IFrameEditorProps extends AbstractContentEditorProps<IFrame> {

}

export interface IFrameEditorState {

}

/**
 * The content editor for Table.
 */
export class IFrameEditor
  extends AbstractContentEditor<IFrame, IFrameEditorProps, IFrameEditorState> {

  constructor(props) {
    super(props);

    this.onSrcEdit = this.onSrcEdit.bind(this);
    this.onHeightEdit = this.onHeightEdit.bind(this);
    this.onWidthEdit = this.onWidthEdit.bind(this);
    this.onPopoutEdit = this.onPopoutEdit.bind(this);
    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onCaptionEdit = this.onCaptionEdit.bind(this);
  }

  onPopoutEdit(content: string) {
    const popout = this.props.model.popout.with({ content });
    this.props.onEdit(this.props.model.with({ popout }));
  }

  onTitleEdit(text: ContentElements) {
    const titleContent = this.props.model.titleContent.with({ text });
    this.props.onEdit(this.props.model.with({ titleContent }));
  }

  onCaptionEdit(content: ContentElements) {
    const caption = this.props.model.caption.with({ content });
    this.props.onEdit(this.props.model.with({ caption }));
  }

  onSrcEdit(src: string) {
    this.props.onEdit(this.props.model.with({ src }));
  }

  onHeightEdit(height: string) {
    this.props.onEdit(this.props.model.with({ height }));
  }

  onWidthEdit(width: string) {
    this.props.onEdit(this.props.model.with({ width }));
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
    const { src } = this.props.model;

    return (
      <div style={ { marginTop: '70px' } }>

        {this.row('URL', '6', <div className="input-group">
          <TextInput width="100%" label=""
            editMode={this.props.editMode}
            value={src}
            type="text"
            onEdit={this.onSrcEdit}
          />
        </div>)}

        {this.row('', '6', <span className="form-text text-muted">
          Enter a publicly resolvable URL (e.g. "https://www.google.com")
        </span>)}

      </div>
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

        {this.row('Height', '1', <div className="input-group input-group-sm">
            <TextInput width="100px" label=""
            editMode={this.props.editMode}
            value={height}
            type="number"
            onEdit={this.onHeightEdit}
          /><span className="input-group-addon ">pixels</span></div>)}
        {this.row('Width', '1', <div className="input-group input-group-sm">
            <TextInput width="100px" label=""
            editMode={this.props.editMode}
            value={width}
            type="number"
            onEdit={this.onWidthEdit}
          /><span className="input-group-addon" id="basic-addon2">pixels</span></div>)}

      </div>
    );
  }

  renderOther() {
    const { titleContent, caption, popout } = this.props.model;

    return (
      <div style={ { marginTop: '30px' } }>


          {this.row('Title', '8', <ContentContainer
            {...this.props}
            model={titleContent.text}
            editMode={this.props.editMode}
            onEdit={this.onTitleEdit}
          />)}

          <br/>

          {this.row('Caption', '8', <ContentContainer
          {...this.props}
          model={caption.content}
          editMode={this.props.editMode}
          onEdit={this.onCaptionEdit}
          />)}

          <br/>

          {this.row('Popout', '8', <TextInput width="100%" label=""
              editMode={this.props.editMode}
              value={popout.content}
              type="text"
              onEdit={this.onPopoutEdit}
            />)}

      </div>
    );
  }

  renderSidebar() {
    return null;
  }
  renderToolbar() {
    return null;
  }

  renderMain() : JSX.Element {

    return (
      <div className="itemWrapper">

        <br/>

        <TabContainer labels={['Source', 'Sizing', 'Other']}>
          {this.renderSource()}
          {this.renderSizing()}
          {this.renderOther()}
        </TabContainer>

      </div>
    );

  }

}

