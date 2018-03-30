import * as React from 'react';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { Select } from '../common/controls';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { Maybe } from 'tsmonad';
import * as contentTypes from 'data/contentTypes';
import { PurposeTypes } from 'data/content/learning/common';
import { ToolbarContentContainer } from 'editors/content/container/ToolbarContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { TitleTextEditor } from 'editors/content/learning/contiguoustext/TitleTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import { CONTENT_COLORS } from 'editors/content/utils/content';

import './nested.scss';

export interface SectionEditorProps
  extends AbstractContentEditorProps<contentTypes.WorkbookSection> {
  onShowSidebar: () => void;
}

export interface SectionEditorState {

}

export default class SectionEditor extends AbstractContentEditor
  <contentTypes.WorkbookSection, SectionEditorProps, SectionEditorState> {
  constructor(props) {
    super(props);

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onBodyEdit = this.onBodyEdit.bind(this);
    this.onPurposeChange = this.onPurposeChange.bind(this);
  }

  onTitleEdit(ct: ContiguousText, sourceObject) {
    const content = this.props.model.title.text.content.set(ct.guid, ct);
    const text = this.props.model.title.text.with({ content });
    const title = this.props.model.title.with({ text });
    const model = this.props.model.with({ title });
    this.props.onEdit(model, sourceObject);
  }

  onBodyEdit(body, sourceObject) {
    const model = this.props.model.with({ body });
    this.props.onEdit(model, sourceObject);
  }

  onPurposeChange(purpose) {
    const model = this.props.model.with({
      purpose: purpose === ''
        ? Maybe.nothing()
        : Maybe.just(purpose),
    });
    this.props.onEdit(model, model);
  }

  renderSidebar(): JSX.Element {
    const { model } = this.props;

    return (
      <SidebarContent title="Section" />
    );
  }

  renderToolbar(): JSX.Element {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Section" columns={8} highlightColor={CONTENT_COLORS.Section}>
        <ToolbarLayout.Column>
            <div style={{ marginLeft: 8 }}>Purpose</div>
            <Select
              editMode={this.props.editMode}
              label=""
              value={this.props.model.purpose.caseOf({
                nothing: () => '',
                just: p => p,
              })}
              onChange={this.onPurposeChange}>
              <option value={''}>
                {''}
              </option>
              {PurposeTypes.map(p =>
                <option
                  key={p.value}
                  value={p.value}>
                  {p.label}
                </option>)}
            </Select>
        </ToolbarLayout.Column>

        <ToolbarButton onClick={() => onShowSidebar()} size={ToolbarButtonSize.Large}>
          <div><i style={{ textDecoration: 'underline' }}>Abc</i></div>
          <div>Title</div>
        </ToolbarButton>
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
        model={(this.props.model.title.text.content.first() as ContiguousText)}
        editMode={this.props.editMode}
        onEdit={this.onTitleEdit}
        editorStyles={{ fontSize: 20 }} />

      <div className="nested-container">
        <ContentContainer
          activeContentGuid={null}
          hover={null}
          onUpdateHover={() => {}}
          {...this.props}
          model={this.props.model.body}
          onEdit={this.onBodyEdit}
        />
      </div>
    </div>
    );
  }
}
