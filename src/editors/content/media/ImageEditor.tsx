import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { ContentState } from 'draft-js';
import * as persistence from '../../../data/persistence';
import { Image }  from '../../../data/content/html/image';
import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import guid from '../../../utils/guid';
import { extractFileName } from './utils';
import { Sources } from './Sources';
import { Tracks } from './Tracks';
import { LabeledType, LabeledEditor } from '../labeled/LabeledEditor';
import { RichTextEditor } from '../common/RichTextEditor';
import { TextInput } from '../common/TextInput';
import { InputLabel } from '../common/InputLabel';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Collapse } from '../common/Collapse';
import { Checkbox } from '../common/Checkbox';
import { TabContainer } from '../common/TabContainer';

import '../common/editor.scss';


export interface ImageEditor {
  
}

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
    this.onFileChange = this.onFileChange.bind(this);
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
    } else if (nextState.failure !== this.state.failure) {
      return true;
    } else if (nextState.isDefaultSizing !== this.state.isDefaultSizing) {
      return true;
    }
    return false;
  }

  adjust(path) {
    const dirCount = this.props.context.resourcePath.split('\/').length;
    let updated = path;
    for (let i = 0; i < dirCount; i += 1) {
      updated = '../' + updated;
    }
    return updated;
  }

  onFileChange(e) {
    const file = e.target.files[0];
    const src = file.name;
    
    persistence.createWebContent(this.props.context.courseId, file)
    .then((result) => {
      this.setState(
        { failure: false }, 
        () => this.props.onEdit(this.props.model.with({ src: this.adjust(result) })));
    })
    .catch((err) => {
      this.setState({ failure: true });
    });
  }

  openFileDialog(id) {
    (window as any).$('#' + id).trigger('click');
  }

  onLabeledEdit(model: LabeledType) {

    const { titleContent, cite, caption } = model;
    const updated = this.props.model.with({ titleContent, cite, caption });
   
    this.props.onEdit(updated);
  }

  onPopoutEdit(content: ContentState) {
    const popout = this.props.model.popout.with({ content });
    this.props.onEdit(this.props.model.with({ popout }));
  }

  onAlternateEdit(content: ContentState) {
    const alternate = this.props.model.alternate.with({ content });
    this.props.onEdit(this.props.model.with({ alternate }));
  }

  onTitleEdit(content: ContentState) {
    const titleContent = this.props.model.titleContent.with({ content });
    this.props.onEdit(this.props.model.with({ titleContent }));
  }

  onCaptionEdit(content: ContentState) {
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

    const { titleContent, caption, cite, popout, alternate,
      width, height, alt, valign } = this.props.model;
    
    const { src } = this.props.model;
    let srcDisplay;
    if (!this.state.failure) {
      const contents = (src === '' || src.indexOf('via.placeholder.com') !== -1)
        ? '' : extractFileName(src);
      srcDisplay = <input type="text" id="disabledTextInput" 
        className="form-control" placeholder={contents} readOnly/>;
    } else {
      srcDisplay = 
        <div className="alert alert-danger" role="alert">
          <strong>Failed</strong> Rename the file and try again
        </div>;
    }
    const id : string = guid();

    return (
      <div style={ { marginTop: '70px' } }>
        
        {this.row('Image', '6', <div className="input-group">
          <input 
            id={id}
            style={ { display: 'none' } }
            accept="image/*"
            onChange={this.onFileChange} 
            type="file" 
          />
          {srcDisplay}
          <span className="input-group-btn">
            <Button editMode={this.props.editMode}
          onClick={this.openFileDialog.bind(this, id)}>Browse...</Button>
          </span>
        </div>)}

        {this.row('', '6', <span className="form-text text-muted">
          Browse to and select an image file from your computer to upload
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
    const { titleContent, caption, cite, popout, alternate,
      width, height, alt, valign } = this.props.model;
    
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
    const { titleContent, caption, cite, popout, alternate,
      width, height, alt, valign } = this.props.model;
    
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

          {this.row('Title', '8', <RichTextEditor showLabel={false} label=""
          {...this.props}
          model={titleContent.content}
          editMode={this.props.editMode}
          onEdit={this.onTitleEdit}
          />)}


          {this.row('Caption', '8', <RichTextEditor showLabel={false} label=""
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

        <br/>

        <TabContainer labels={['Source', 'Sizing', 'Other']}>
          {this.renderSource()}
          {this.renderSizing()}
          {this.renderOther()}          
        </TabContainer>
    
      </div>);
  }

}

