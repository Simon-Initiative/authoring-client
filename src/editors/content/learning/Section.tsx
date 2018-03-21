import * as React from 'react';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { Select } from '../common/controls';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { Maybe } from 'tsmonad';
import { Section as SectionType } from 'data/content/workbook/section';
import { PurposeTypes } from 'data/content/learning/common';
import { ToolbarContentContainer } from 'editors/content/container/ToolbarContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import ContiguousTextEditor from 'editors/content/learning/ContiguousTextEditor.tsx';
import { CONTENT_COLORS } from 'editors/content/utils/content';

import './nested.scss';

export interface SectionProps extends AbstractContentEditorProps<SectionType> {
  onShowSidebar: () => void;
}

export interface SectionState {

}

export class Section extends AbstractContentEditor<SectionType, SectionProps, SectionState> {
  constructor(props) {
    super(props);

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onBodyEdit = this.onBodyEdit.bind(this);
    this.onPurposeChange = this.onPurposeChange.bind(this);
  }

  onTitleEdit(title, sourceObject) {
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
      <SidebarContent title="Section">
        <SidebarGroup label="Title">
          <ToolbarContentContainer
            {...this.props}
            activeContentGuid={null}
            hover={null}
            onUpdateHover={() => {}}
            model={model.title.text}
            onEdit={text => this.onTitleEdit(model.title.with({ text }), model)} />
        </SidebarGroup>
      </SidebarContent>
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
      <ContiguousTextEditor
        {...this.props}
        model={(this.props.model.title.text.content as any).first()}
        editorStyles={{ fontSize: 20 }}
        viewOnly
        onEdit={() => {}} />
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
