import * as React from 'react';
import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import guid from '../../../utils/guid';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';
import InlineInsertionToolbar from '../html/InlineInsertionToolbar';
import { Select } from '../common/controls';
import { ContentTitle } from 'editors/content/common/ContentTitle.tsx';

import './ContentEditor.scss';

type IdTypes = {
  availability: string,
};

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
  ids: IdTypes;

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

  renderTitle() {
    const { model, onRemove } = this.props;

    return (
      <ContentTitle title="Content" onRemove={() => onRemove(model.guid)} />
    );
  }

  renderOptions() {
    const { editMode, model } = this.props;

    return (
      <div className="content-options">
        {
        /** availability options disabled. To re-enable, uncomment this block */
        /**
        <Select onChange={this.onAvailability} label="Availability"
          editMode={editMode}
          value={model.availability}>
          <option value="always">Always</option>
          <option value="instructor_only">Instructor Only</option>
          <option value="feedback_only">Feedback Only</option>
          <option value="never">Never</option>
        </Select>
        */}
      </div>
    );
  }

  renderBody() {
    const bodyStyle = {
      minHeight: '30px',
      borderStyle: 'none',
      borderWith: 1,
      borderColor: '#AAAAAA',
    };

    return (
      <div className="content-body">
        <HtmlContentEditor
          editorStyles={bodyStyle}
          inlineToolbar={<InlineToolbar/>}
          blockToolbar={<BlockToolbar/>}
          inlineInsertionToolbar={<InlineInsertionToolbar/>}
          {...this.props}
          model={this.props.model.body}
          onEdit={this.onBodyEdit}
          />
      </div>
    );
  }

  render() : JSX.Element {

    return (
      <div className="content-editor">
        {this.renderTitle()}
        {this.renderBody()}
      </div>
    );
  }
}
