import * as React from 'react';

import { YouTube } from '../../../data/content/learning/youtube';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { ContentElements } from 'data/content/common/elements';
import { TextInput } from '../common/TextInput';
import { ContentContainer } from '../container/ContentContainer';
import { Collapse } from '../common/Collapse';

export interface YouTubeEditorProps extends AbstractContentEditorProps<YouTube> {

}

export interface YouTubeEditorState {
  src: string;
}

/**
 * The content editor for Table.
 */
export class YouTubeEditor
  extends AbstractContentEditor<YouTube, YouTubeEditorProps, YouTubeEditorState> {

  constructor(props) {
    super(props);

    this.onSrcEdit = this.onSrcEdit.bind(this);
    this.onHeightEdit = this.onHeightEdit.bind(this);
    this.onWidthEdit = this.onWidthEdit.bind(this);
    this.onPopoutEdit = this.onPopoutEdit.bind(this);
    this.onAlternateEdit = this.onAlternateEdit.bind(this);
    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onCaptionEdit = this.onCaptionEdit.bind(this);

    this.state = {
      src: this.props.model.src,
    };
  }

  onPopoutEdit(content: string) {
    const popout = this.props.model.popout.with({ content });
    this.props.onEdit(this.props.model.with({ popout }));
  }

  onAlternateEdit(content: ContentElements) {
    const alternate = this.props.model.alternate.with({ content });
    this.props.onEdit(this.props.model.with({ alternate }));
  }

  onSrcEdit(e) {
    const src = e.target.value;
    this.setState(
      { src }, () => this.props.onEdit(this.props.model.with({ src })));
  }

  onHeightEdit(height: string) {
    this.props.onEdit(this.props.model.with({ height }));
  }

  onWidthEdit(width: string) {
    this.props.onEdit(this.props.model.with({ width }));
  }


  onTitleEdit(text: ContentElements) {
    const titleContent = this.props.model.titleContent.with({ text });
    this.props.onEdit(this.props.model.with({ titleContent }));
  }

  onCaptionEdit(content: ContentElements) {
    const caption = this.props.model.caption.with({ content });
    this.props.onEdit(this.props.model.with({ caption }));
  }

  row(text: string, width: string, control: any) {
    const widthClass = 'col-' + width;
    return (
      <div className="form-group row">
        <label className="col-1 col-form-label">{text}</label>
        <div className={widthClass}>
          {control}
        </div>
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

    const { titleContent, caption, popout, height, width } = this.props.model;

    return (
      <div className="itemWrapper container">
        <br/>

        <p>Enter the id of the YouTube video you wish to display:</p>

        {this.row('', '9', <div className="input-group">
            <span className="input-group-addon">https://youtube.com/watch?v=</span>
            <input type="text" value={this.state.src}
              onChange={this.onSrcEdit.bind(this)} className="form-control"/>
            </div>)}

        <Collapse caption="Additional properties">

        {this.row('Height', '2', <div className="input-group input-group-sm">
            <TextInput width="100%" label=""
            editMode={this.props.editMode}
            value={height}
            type="number"
            onEdit={this.onHeightEdit}
          /><span className="input-group-addon ">pixels</span></div>)}

        {this.row('Width', '2', <div className="input-group input-group-sm">
           <TextInput width="100%" label=""
            editMode={this.props.editMode}
            value={width}
            type="number"
            onEdit={this.onWidthEdit}
          /><span className="input-group-addon" id="basic-addon2">pixels</span></div>)}

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
        </Collapse>

      </div>);
  }

}

