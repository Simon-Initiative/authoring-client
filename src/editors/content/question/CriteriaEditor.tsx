import * as React from 'react';
import * as Immutable from 'immutable';
import { ContentState, EditorState, ContentBlock, convertToRaw, SelectionState } from 'draft-js';
import * as contentTypes from '../../../data/contentTypes';
import { AuthoringActionsHandler, AuthoringActions } from '../../../actions/authoring';
import { AppServices } from '../../common/AppServices';
import DraftWrapper from '../../content/common/draft/DraftWrapper';
import { AbstractContentEditor,
  AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import guid from '../../../utils/guid';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';
import InlineInsertionToolbar from '../html/InlineInsertionToolbar';
import { TextInput, InlineForm, Button, Checkbox, Select } from '../common/controls';
import { Collapse } from '../common/Collapse';
import { getHtmlDetails } from '../common/details';
import { RemovableContent } from '../common/RemovableContent';

type IdTypes = {
  score: string,
};

export interface CriteriaEditorProps
  extends AbstractContentEditorProps<contentTypes.GradingCriteria> {
  onRemove: (guid: string) => void;
}

export interface CriteriaEditorState {

}

/**
 * The content editor for HtmlContent.
 */
export class CriteriaEditor
  extends AbstractContentEditor<contentTypes.GradingCriteria,
  CriteriaEditorProps, CriteriaEditorState> {
  ids: IdTypes;

  constructor(props) {
    super(props);

    this.ids = {
      score: guid(),
    };
    this.onBodyEdit = this.onBodyEdit.bind(this);
    this.onScore = this.onScore.bind(this);
  }

  onBodyEdit(body) {
    const concept = this.props.model.with({ body });
    this.props.onEdit(concept);
  }

  onScore(score) {
    this.props.onEdit(this.props.model.with({ score }));
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
    const insertionToolbar = <InlineInsertionToolbar/>;

    const bodyStyle = {
      minHeight: '30px',
      borderStyle: 'none',
      borderWith: 1,
      borderColor: '#AAAAAA',
    };

    const controls = (
      <form className="form-inline">
        Score:&nbsp;&nbsp;&nbsp;
        <TextInput
          editMode={this.props.editMode}
          width="75px"
          label=""
          value={this.props.model.score}
          type="number"
          onEdit={this.onScore}
        />
      </form>
    );

    return (
      <RemovableContent
        editMode={this.props.editMode}
        onRemove={() => this.props.onRemove(this.props.model.guid)}
        associatedClasses="content">

        {controls}

        <HtmlContentEditor
          editorStyles={bodyStyle}
          inlineToolbar={inlineToolbar}
          inlineInsertionToolbar={insertionToolbar}
          blockToolbar={blockToolbar}
          services={this.props.services}
          context={this.props.context}
          editMode={this.props.editMode}
          model={this.props.model.body}
          onEdit={this.onBodyEdit}/>

      </RemovableContent>
    );
  }
}

