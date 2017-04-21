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
import { InputLabel } from '../common/InputLabel';

import '../common/editor.scss';

type IdTypes = {
  targets: string
}

export interface HintEditor {
  ids: IdTypes;
}

export interface HintEditorProps extends AbstractContentEditorProps<contentTypes.Hint> {
  onRemove: (hint: contentTypes.Hint) => void;
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

  shouldComponentUpdate(nextProps, nextState) {
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
                context={this.props.context}
                services={this.props.services}
                actionHandler={this} />;
    const blockToolbar = <BlockToolbar 
                context={this.props.context}
                services={this.props.services} 
                actionHandler={this} />;

    const bodyStyle = {
      minHeight: '20px',
      borderStyle: 'none',
      borderWith: 1,
      borderColor: '#AAAAAA'
    }

    const style = {
      width: '80px'
    }

    return (
      <div className='itemWrapper'>

      <InputLabel label="Hint" style="default" onRemove={this.props.onRemove.bind(this, this.props.model)}>
          <HtmlContentEditor 
            editorStyles={bodyStyle}
            inlineToolbar={inlineToolbar}
            blockToolbar={blockToolbar}
            {...this.props}
            editHistory={this.state.editHistory}
            model={this.props.model.body}
            onEdit={this.onBodyEdit} 
            />
        </InputLabel>

      </div>);
  }

}

