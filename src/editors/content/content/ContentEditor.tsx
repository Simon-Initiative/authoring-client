import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import guid from 'utils/guid';
import { ContentTitle } from 'editors/content/common/ContentTitle';

import './ContentEditor.scss';
import { ContentElements } from 'data/content/common/elements';

type IdTypes = {
  availability: string,
};

export interface ContentEditorProps extends AbstractContentEditorProps<contentTypes.Content> {
  onRemove: (guid: string) => void;
  onDuplicate?: () => void;
  activeContentGuid: string;
  hover: string;
  onUpdateHover: (hover: string) => void;
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

  /** Override Parent Method */
  handleOnClick(e) {
    if (this.props.onHandleClick !== undefined) {
      this.props.onHandleClick(e);
    }
  }

  onBodyEdit(body: ContentElements, src) {
    const content = this.props.model.with({ body });
    this.props.onEdit(content, src);
  }

  onAvailability(availability: string, src) {
    this.props.onEdit(this.props.model.with({ availability }), src);
  }

  renderTitle() {
    const { model, editMode, onRemove } = this.props;

    return (
      <ContentTitle
        title="Supporting Content"
        editMode={editMode}
        onRemove={() => onRemove(model.guid)}
        canRemove={true} />
    );
  }

  renderOptions() {
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
    return (
      <div className="content-body">
        <ContentContainer
          {...this.props}
          model={this.props.model.body}
          onEdit={this.onBodyEdit}
        />
      </div>
    );
  }

  renderSidebar() {
    return null;
  }
  renderToolbar() {
    return null;
  }

  renderMain(): JSX.Element {

    return (
      <div className="content-editor">
        {this.renderTitle()}
        {this.renderBody()}
      </div>
    );
  }
}
