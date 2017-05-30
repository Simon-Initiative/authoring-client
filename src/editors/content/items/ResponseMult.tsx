import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';

import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import guid from '../../../utils/guid';
import { TextInput } from '../common/TextInput';
import { InputLabel } from '../common/InputLabel';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { MatchEditor } from './MatchEditor';

import '../common/editor.scss';


export interface ResponseMultEditor {
  
}

export interface ResponseMultEditorProps 
  extends AbstractContentEditorProps<contentTypes.ResponseMult> {
  
}

export interface ResponseMultEditorState {
  
}

/**
 * The content editor for Table.
 */
export class ResponseMultEditor 
  extends AbstractContentEditor<contentTypes.ResponseMult, 
  ResponseMultEditorProps, ResponseMultEditorState> {
    
  constructor(props) {
    super(props);
    
    this.onScoreEdit = this.onScoreEdit.bind(this);
    this.onMatchStyleEdit = this.onMatchStyleEdit.bind(this);
    this.onMatchEdit = this.onMatchEdit.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    return false;
  }

  onScoreEdit(score) {

  }

  onMatchStyleEdit(matchStyle) {

  }

  onMatchEdit(match) {

  }

  render() : JSX.Element {

    const { score, matchStyle, matches } = this.props.model;

    const matchEditors = matches.map(
      m => <MatchEditor
            {...this.props}
            model={m}
            onEdit={this.onMatchEdit.bind(this)}
            />);
    
    return (
      <div className="itemWrapper">
        <form className="inline">
      
          <Select editMode={this.props.editMode} 
            label="Match style" value={matchStyle} 
            onChange={this.onMatchStyleEdit}>
            <option value="any">Any</option>
            <option value="all">All</option>
            <option value="none">None</option>
          </Select>

          Score:&nbsp;&nbsp;&nbsp;
          <TextInput
            editMode={this.props.editMode} 
            width="75px"
            label=""
            value={score}
            type="number"
            onEdit={this.onScoreEdit}
          />
          
        </form>

        {matchEditors}
        
      </div>);
  }

}

