
import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { AuthoringActionsHandler, AuthoringActions } from '../../../actions/authoring';
import { AppServices } from '../../common/AppServices';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import guid from '../../../utils/guid';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';
import { InputLabel } from '../common/InputLabel';

import '../common/editor.scss';


export interface Choice {
}

export interface ChoiceProps extends AbstractContentEditorProps<contentTypes.Choice> {
  onRemove: (choice: contentTypes.Choice) => void;
  label?: string;
}

export interface ChoiceState {

}

/**
 * The content editor for HtmlContent.
 */
export class Choice 
  extends AbstractContentEditor<contentTypes.Choice, ChoiceProps, ChoiceState> {
    
  constructor(props) {
    super(props);

    this.onBodyEdit = this.onBodyEdit.bind(this);
  }

  onBodyEdit(body) {
    const concept = this.props.model.with({body});
    this.props.onEdit(concept);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    return false;
  }

  render() : JSX.Element {
    
    const inlineToolbar = <InlineToolbar/>;
    const blockToolbar = <BlockToolbar/>;

    const bodyStyle = {
      minHeight: '20px',
      borderStyle: 'none',
      borderWith: 1,
      borderColor: '#AAAAAA'
    }

    const label = this.props.label === undefined ? 'Choice' : this.props.label;

    return (
      <InputLabel label={label} style="default" onRemove={this.props.onRemove.bind(this, this.props.model)}>
        <HtmlContentEditor 
            editorStyles={bodyStyle}
            inlineToolbar={inlineToolbar}
            blockToolbar={blockToolbar}
            {...this.props}
            model={this.props.model.body}
            onEdit={this.onBodyEdit} 
            />
      </InputLabel>);
  }

}

