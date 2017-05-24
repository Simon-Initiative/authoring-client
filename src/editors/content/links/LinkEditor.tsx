import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { Link }  from '../../../data/content/html/link';
import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { TextInput } from '../common/TextInput';
import { InputLabel } from '../common/InputLabel';
import { Button } from '../common/Button';

import '../common/editor.scss';


export interface LinkEditor {
  
}

export interface LinkEditorProps extends AbstractContentEditorProps<Link> {
  
}

export interface LinkEditorState {
  
}

/**
 * The content editor for Table.
 */
export class LinkEditor 
  extends AbstractContentEditor<Link, LinkEditorProps, LinkEditorState> {
    
  constructor(props) {
    super(props);
    
    this.onTargetEdit = this.onTargetEdit.bind(this);
    this.onHrefEdit = this.onHrefEdit.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState: LinkEditorState) {
    if (nextProps.model !== this.props.model) {
      return true;
    } 
    return false;
  }

  onTargetEdit(target) {
    this.props.onEdit(this.props.model.with({ target }));
  }

  onHrefEdit(href) {
    this.props.onEdit(this.props.model.with({ href }));
  }

  render() : JSX.Element {

    const { href, target } = this.props.model;
    
    return (
      <div className="itemWrapper">

        <InputLabel label="href">
          <TextInput width="100%" label="" 
            value={href} 
            type="text"
            onEdit={this.onHrefEdit}
          />
        </InputLabel>

        <InputLabel label="target">
          <TextInput width="100%" label="" 
            value={target} 
            type="text"
            onEdit={this.onTargetEdit}
          />
        </InputLabel>
        
      </div>);
  }

}

