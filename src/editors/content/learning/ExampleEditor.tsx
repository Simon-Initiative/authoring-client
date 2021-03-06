import * as React from 'react';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import * as contentTypes from 'data/contentTypes';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { TitleTextEditor } from 'editors/content/learning/contiguoustext/TitleTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import { CONTENT_COLORS } from 'editors/content/utils/content';

import './nested.scss';

export interface ExampleEditorProps extends AbstractContentEditorProps<contentTypes.Example> {
  onShowSidebar: () => void;
}

export interface ExampleEditorState {

}

export default class ExampleEditor
  extends AbstractContentEditor<contentTypes.Example, ExampleEditorProps, ExampleEditorState> {
  constructor(props) {
    super(props);

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onContentEdit = this.onContentEdit.bind(this);
  }

  onTitleEdit(ct: ContiguousText, sourceObject) {
    const content = this.props.model.title.text.content.set(ct.guid, ct);
    const text = this.props.model.title.text.with({ content });
    const title = this.props.model.title.with({ text });
    const model = this.props.model.with({ title });
    this.props.onEdit(model, sourceObject);
  }

  onContentEdit(content, sourceObject) {
    const model = this.props.model.with({ content });
    this.props.onEdit(model, sourceObject);
  }

  renderSidebar(): JSX.Element {
    return (
      <SidebarContent title="Example" />
    );
  }

  renderToolbar(): JSX.Element {
    return (
      <ToolbarGroup label="Example" columns={3} highlightColor={CONTENT_COLORS.Example}>
      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {
    return (
      <div className="ExampleEditor">
        <div className="nested-container">
          <TitleTextEditor
            context={this.props.context}
            services={this.props.services}
            onFocus={this.props.onFocus}
            model={(this.props.model.title.text.content.first() as ContiguousText)}
            editMode={this.props.editMode}
            onEdit={this.onTitleEdit}
            editorStyles={{ fontSize: 20 }} />

          <ContentContainer
            {...this.props}
            model={this.props.model.content}
            onEdit={this.onContentEdit}
          />
        </div>
      </div>
    );
  }
}
