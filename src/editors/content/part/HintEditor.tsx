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
  targets: string
}

export interface HintEditor {
  ids: IdTypes;
}

export interface HintEditorProps extends AbstractContentEditorProps<contentTypes.Hint> {

}

export interface HintEditorState {

  editHistory: Immutable.List<AuthoringActions>;

  targets: string;
}

/**
 * The content editor for HtmlContent.
 */
export class HintEditor 
  extends AbstractContentEditor<contentTypes.Hint, HintEditorProps, HintEditorState> {
    
  constructor(props) {
    super(props);

    this.state = {
      editHistory: Immutable.List<AuthoringActions>(),
      targets: this.props.model.targets
    };
    this.ids = {
      targets: guid()
    }
    this.onBodyEdit = this.onBodyEdit.bind(this);
    this.onTargetChange = this.onTargetChange.bind(this);
  }

  handleAction(action: AuthoringActions) {
    this.setState({
      editHistory: this.state.editHistory.insert(0, action)
    });
  }

  shouldComponetUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    if (nextState.editHistory !== this.state.editHistory) {
      return true;
    }
    return false;
  }

  onBodyEdit(body) {
    const concept = this.props.model.with({body});
    this.props.onEdit(concept);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ targets: nextProps.model.targets});
  }

  onTargetChange(e) {
    const targets = e.target.value;
    this.setState({ targets }, () => 
      this.props.onEdit(this.props.model.with({targets })));
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
      minHeight: '30px',
      borderStyle: 'none',
      borderWith: 1,
      borderColor: '#AAAAAA'
    }

    const style = {
      width: '80px'
    }

    return (
      <div className='itemWrapper'>

        <form className="form-inline">
           <div><b>Hint</b></div>
           &nbsp;&nbsp;&nbsp;&nbsp;Targets&nbsp;&nbsp;
           <input style={style} onChange={this.onTargetChange} className="form-control form-control-sm" type="text" value={this.state.targets} id={this.ids.targets}/>
        </form>

        <HtmlContentEditor 
              titleOracle={this.props.titleOracle}
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

      </div>);
  }

}

