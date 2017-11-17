
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
import InlineInsertionToolbar from '../html/InlineInsertionToolbar';
import { TextInput, InlineForm, Button, Checkbox, Select } from '../common/controls';
import { Collapse } from '../common/Collapse';
import { getHtmlDetails } from '../common/details';
import { RemovableContent } from '../common/RemovableContent';
import { DragHandle } from '../../document/assessment/DragHandle';

import '../common/editor.scss';

type IdTypes = {
  availability: string,
};

export interface ContentEditor {
  ids: IdTypes;
}

export interface ContentEditorProps extends AbstractContentEditorProps<contentTypes.Content> {
  onRemove: (guid: string) => void;
}

export interface ContentEditorState {

}

/**
 * The content editor for HtmlContent.
 */
export class ContentEditor
  extends AbstractContentEditor<contentTypes.Content, ContentEditorProps, ContentEditorState> {

  constructor(props) {
    super(props);

    this.ids = {
      availability: guid(),
    };
    this.onBodyEdit = this.onBodyEdit.bind(this);
    this.onAvailability = this.onAvailability.bind(this);
  }

  onBodyEdit(body) {
    const concept = this.props.model.with({ body });
    this.props.onEdit(concept);
  }

  onAvailability(availability) {
    this.props.onEdit(this.props.model.with({ availability }));
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

    const expanded = (
      <InlineForm position="right">
        <Select onChange={this.onAvailability} label="Availability"
          editMode={this.props.editMode}
          value={this.props.model.availability}>
          <option value="always">Always</option>
          <option value="instructor_only">Instructor Only</option>
          <option value="feedback_only">Feedback Only</option>
          <option value="never">Never</option>
        </Select>
      </InlineForm>
    );

    return (
      <RemovableContent
        editMode={this.props.editMode}
        onRemove={() => this.props.onRemove(this.props.model.guid)}
        associatedClasses="content">

        <div style={ { position: 'relative' } }>

          <Collapse
            caption="Content"
            details={getHtmlDetails(this.props.model.body)}
            expanded={expanded}>

            <HtmlContentEditor
                  editorStyles={bodyStyle}
                  inlineToolbar={inlineToolbar}
                  blockToolbar={blockToolbar}
                  inlineInsertionToolbar={insertionToolbar}
                  {...this.props}
                  model={this.props.model.body}
                  onEdit={this.onBodyEdit}
                  />
          </Collapse>

        </div>

      </RemovableContent>);
  }

}

