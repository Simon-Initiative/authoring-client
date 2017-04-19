'use strict'

import * as React from 'react';

import { AppServices } from '../../common/AppServices';
import { toggleInlineStyle, toggleBlockType, insertInlineEntity, AuthoringActionsHandler } from '../../../actions/authoring';
import { EntityTypes } from '../../../data/content/html/common';

export interface ToolbarProps {  
  onAddQuestion: () => void;
  onAddContent: () => void;
}

export interface Toolbar {
  
}


export class Toolbar extends React.PureComponent<ToolbarProps, {}> {

  shouldComponentUpdate(nextProps, nextState) {
    return false; 
  }

  render() {
    return (
      <div>
        <div className="btn-group btn-group-sm" role="group" aria-label="Assessment Toolbar">
          <button onClick={this.props.onAddContent} type="button" className="btn btn-primary">Add Content</button>
          <button onClick={this.props.onAddQuestion} type="button" className="btn btn-primary">Add Question</button>
        </div>
      </div>
      );
  }

}

export default Toolbar;


