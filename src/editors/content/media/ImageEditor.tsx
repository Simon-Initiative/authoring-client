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

import '../common/editor.scss';


export interface ImageEditor {
  
}

export interface ImageEditorProps extends AbstractContentEditorProps<Image> {
  
}

export interface ImageEditorState {
  failure: boolean;
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

    this.state = {
      failure: false,
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

  onSetClick() {
    // TODO 
  }

  row(text: string, width: string, control: any) {
    const widthClass = 'col-' + width;
    return (
      <div className="form-group row">
        <label className="col-1 col-form-label">{text}</label>
        <div className={widthClass} >
          {control}
        </div>
      </div>
    );
  }

  render() : JSX.Element {

    const { titleContent, caption, cite, popout, alternate,
      width, height, alt, valign } = this.props.model;
    
    const labeled : LabeledType = {
      titleContent,
      caption,
      cite,
    };

    const { src } = this.props.model;
    let srcDisplay;
    if (!this.state.failure) {
      srcDisplay = (src === '' || src.indexOf('via.placeholder.com') !== -1)
        ? '' : extractFileName(src);
    } else {
      srcDisplay = 
        <div className="alert alert-danger" role="alert">
          <strong>Failed</strong> Rename the file and try again
        </div>;
    }
    const id : string = guid();

    return (
      <div className="itemWrapper container">
        
        {this.row('Height', '3', <TextInput width="100%" label="" 
            editMode={this.props.editMode}
            value={height} 
            type="text"
            onEdit={this.onHeightEdit}
          />)}
        {this.row('Width', '3', <TextInput width="100%" label="" 
            editMode={this.props.editMode}
            value={width} 
            type="text"
            onEdit={this.onWidthEdit}
          />)}
        {this.row('Alt', '8', <TextInput width="100%" label="" 
            editMode={this.props.editMode}
            value={alt} 
            type="text"
            onEdit={this.onAltEdit}
          />)}


          

        <InputLabel label="Source">
          <input 
            id={id}
            style={ { display: 'none' } }
            accept="image/*"
            onChange={this.onFileChange} 
            type="file" 
          />
          <div className="input-group">
            {srcDisplay}
            <span className="input-group-btn">
              <Button editMode={this.props.editMode}
            onClick={this.openFileDialog.bind(this, id)}>Browse...</Button>
            </span>
          </div>
        </InputLabel>

        <InputLabel label="VAlign">
          <TextInput width="100%" label="Popout content" 
            editMode={this.props.editMode}
            value={valign} 
            type="text"
            onEdit={this.onValignEdit}
          />
        </InputLabel>

        <LabeledEditor 
          {...this.props}
          model={labeled} 
          onEdit={this.onLabeledEdit}
          />


        <InputLabel label="Popout">
          <TextInput width="100%" label="Popout content" 
            editMode={this.props.editMode}
            value={popout.content} 
            type="text"
            onEdit={this.onPopoutEdit}
          />
        </InputLabel>

      </div>);
  }

}

