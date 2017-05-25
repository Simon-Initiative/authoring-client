import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, 
  AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { TextInput, InlineForm, Button, Checkbox, Collapse, Select } from '../common/controls';
import guid from '../../../utils/guid';
import { describePool } from './details';

import '../common/editor.scss';


export interface PoolRefEditor {
  
}

export interface PoolRefProps extends AbstractContentEditorProps<contentTypes.PoolRef> {

}

export interface PoolRefState {
  pool: contentTypes.Pool;
}


/**
 * The content editor for HtmlContent.
 */
export class PoolRefEditor 
  extends AbstractContentEditor<contentTypes.PoolRef, PoolRefProps, PoolRefState> {
    
  constructor(props) {
    super(props);
    
    this.onEditRef = this.onEditRef.bind(this);

    this.state = {
      pool: null,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (nextProps.model !== this.props.model);
  }

  onEditRef(idref: string) {
    this.props.onEdit(this.props.model.with({ idref }));
  }

  render() : JSX.Element {

    let details;
    if (this.props.model.idref === '') {
      details = 'No external pool selected';
    } else if (this.state.pool === null) {
      details = '';
    } else {
      details = describePool(this.state.pool);
    }
    
    return (
      <div className="componentWrapper poolref">
        <div className="input-group">
          <input type="text" className="form-control" disabled/>
          <span className="input-group-btn">
            <button className="btn btn-primary" type="button">Select</button>
          </span>
        </div>
      </div>
    );
  }

}

