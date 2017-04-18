
import * as React from 'react';
import * as Immutable from 'immutable';
import { ContentState, EditorState, ContentBlock, convertToRaw, SelectionState } from 'draft-js';
import * as contentTypes from '../../../data/contentTypes';
import { AuthoringActionsHandler, AuthoringActions } from '../../../actions/authoring';
import { AppServices } from '../../common/AppServices';
import DraftWrapper from '../../content/common/draft/DraftWrapper';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import guid from '../../../utils/guid';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';

import '../common/editor.scss';

type IdTypes = {
  value: string,
  color: string
}

export interface Choice {
  ids: IdTypes;
}

export interface ChoiceProps extends AbstractContentEditorProps<contentTypes.Choice> {

}

export interface ChoiceState {

  editHistory: Immutable.List<AuthoringActions>;

  value: string;
}

/**
 * The content editor for HtmlContent.
 */
export class Choice 
  extends AbstractContentEditor<contentTypes.Choice, ChoiceProps, ChoiceState> {
    
  constructor(props) {
    super(props);

    this.state = {
      editHistory: Immutable.List<AuthoringActions>(),
      value: this.props.model.value
    };
    this.ids = {
      color: guid(),
      value: guid()
    }
    this.onBodyEdit = this.onBodyEdit.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
    this.onColorChange = this.onColorChange.bind(this);
  }

  handleAction(action: AuthoringActions) {
    this.setState({
      editHistory: this.state.editHistory.insert(0, action)
    });
  }

  onBodyEdit(body) {
    const concept = this.props.model.with({body});
    this.props.onEdit(concept);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.model.value});
  }

  onValueChange(e) {
    this.props.onEdit(this.props.model.with({value: e.target.value}));
  }

  onColorChange(e) {
    this.props.onEdit(this.props.model.with({color: e.target.value}));
  }

  render() : JSX.Element {
    
    const inlineToolbar = <InlineToolbar 
                courseId={this.props.courseId} 
                services={this.props.services} 
                actionHandler={this} />;
    const blockToolbar = <BlockToolbar 
                documentId={this.props.documentId}
                courseId={this.props.courseId} 
                services={this.props.services} 
                actionHandler={this} />;

    const bodyStyle = {
      minHeight: '20px',
      borderStyle: 'none',
      borderWith: 1,
      borderColor: '#AAAAAA'
    }

    return (
      <div className='editorWrapper'>

        <form className="form-inline">
           <label className="mr-sm-2" htmlFor={this.ids.value}>Value</label>
           <input onChange={this.onValueChange} className="form-control" type="text" value={this.state.value} id={this.ids.value}/>
          
           <label htmlFor={this.ids.color} className="col-2 col-form-label">Color</label>
           <input onChange={this.onColorChange} className="form-control" type="color" value={this.props.model.value} id={this.ids.color}/>
        </form>

        <div className="input-group">
          <span className="input-group-addon" id="basic-addon3">Choice</span>
          <HtmlContentEditor 
              editorStyles={bodyStyle}
              inlineToolbar={inlineToolbar}
              blockToolbar={blockToolbar}
              onEditModeChange={this.props.onEditModeChange}
              editMode={this.props.editMode}
              services={this.props.services}
              courseId={this.props.courseId}
              documentId={this.props.documentId}
              userId={this.props.userId}
              editHistory={this.state.editHistory}
              model={this.props.model.body}
              onEdit={this.onBodyEdit} 
              editingAllowed={this.props.editingAllowed}/>
          
        </div>

        

      </div>);
  }

}

