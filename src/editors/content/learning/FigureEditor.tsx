import * as React from 'react';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import * as contentTypes from 'data/contentTypes';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { TitleTextEditor } from 'editors/content/learning/contiguoustext/TitleTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { Title } from 'data/content/learning/title';
import { Maybe } from 'tsmonad';
import { ContentElements } from 'data/content/common/elements';

import './nested.scss';

export interface FigureEditorProps extends AbstractContentEditorProps<contentTypes.Figure> {
  onShowSidebar: () => void;
}

export interface FigureEditorState {

}

export default class FigureEditor
  extends AbstractContentEditor<contentTypes.Figure, FigureEditorProps, FigureEditorState> {
  constructor(props) {
    super(props);

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onContentEdit = this.onContentEdit.bind(this);
  }

  onTitleEdit(ct: ContiguousText, sourceObject) {
    const text = ct.extractPlainText().caseOf({
      just: text => text,
      nothing: () => '',
    });

    const model = this.props.model.with({
      title: text !== ''
        ? Maybe.just(Title.fromText(text))
        : Maybe.nothing(),
    });

    this.props.onEdit(model, sourceObject);
  }

  onContentEdit(content: ContentElements, sourceObject) {
    const model = this.props.model.with({ content });
    this.props.onEdit(model, sourceObject);
  }

  renderSidebar(): JSX.Element {
    return (
      <SidebarContent title="Figure" />
    );
  }

  renderToolbar(): JSX.Element {
    return (
      <ToolbarGroup label="Figure" columns={2} highlightColor={CONTENT_COLORS.Figure}>
      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {
    return (
      <div>
        <TitleTextEditor
          context={this.props.context}
          services={this.props.services}
          onFocus={this.props.onFocus}
          model={(this.props.model.title.caseOf({
            just: t => t.text.content.first() as ContiguousText,
            nothing: () => new ContiguousText(),
          }))}
          editMode={this.props.editMode}
          onEdit={this.onTitleEdit}
          editorStyles={{ fontSize: 20 }} />

        <div className="nested-container">
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
