import * as React from 'react';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { Pullout as PulloutType } from 'data/content/learning/pullout';
import { Select } from '../common/controls';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { ToolbarContentContainer } from 'editors/content/container/ToolbarContentContainer';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { Maybe } from 'tsmonad';
import { Orientation } from 'data/content/learning/common';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import ContiguousTextEditor from 'editors/content/learning/ContiguousTextEditor.tsx';
import { CONTENT_COLORS } from 'editors/content/utils/content';

import './nested.scss';

export interface PulloutProps extends AbstractContentEditorProps<PulloutType> {
  onShowSidebar: () => void;
}

export interface PulloutState {

}

export class Pullout extends AbstractContentEditor<PulloutType, PulloutProps, PulloutState> {
  constructor(props) {
    super(props);

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onContentEdit = this.onContentEdit.bind(this);
    this.onPulloutTypeChange = this.onPulloutTypeChange.bind(this);
    this.onEditOrient = this.onEditOrient.bind(this);
  }

  onTitleEdit(title, sourceObject) {
    const model = this.props.model.with({ title });
    this.props.onEdit(model, sourceObject);
  }

  onContentEdit(content, sourceObject) {
    const model = this.props.model.with({ content });
    this.props.onEdit(model, sourceObject);
  }

  onPulloutTypeChange(pulloutType) {
    const model = this.props.model.with({
      pulloutType: pulloutType === ''
        ? Maybe.nothing()
        : Maybe.just(pulloutType),
    });
    this.props.onEdit(model, model);
  }

  onEditOrient(isVertical) {
    const model = this.props.model.with({
      orient: isVertical
        ? Orientation.Vertical
        : Orientation.Horizontal,
    });
    this.props.onEdit(model, model);
  }

  isOrientVertical() {
    return this.props.model.orient === Orientation.Vertical;
  }

  renderSidebar(): JSX.Element {
    const { model } = this.props;

    return (
      <SidebarContent title="Pullout">
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
      <ToolbarGroup label="Pullout" columns={6} highlightColor={CONTENT_COLORS.Pullout}>
        <ToolbarLayout.Column>
          <Select editMode={this.props.editMode}
            value={this.props.model.pulloutType.caseOf({
              nothing: () => '',
              just: t => t,
            })}
            onChange={this.onPulloutTypeChange}>
            <option value="">Pullout Type</option>
            <option value="note">Note</option>
            <option value="notation">Notation</option>
            <option value="observation">Observation</option>
            <option value="research">Research</option>
            <option value="tip">Tip</option>
            <option value="tosumup">To Sum Up</option>
          </Select>

          <ToggleSwitch
            style={{ marginTop: 10 }}
            editMode={this.props.editMode}
            checked={this.isOrientVertical()}
            onClick={() => this.onEditOrient(!this.isOrientVertical())}
            labelBefore="Vertical" />

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
          {...this.props}
          model={this.props.model.content}
          onEdit={this.onContentEdit}
        />
      </div>
    </div>
    );
  }
}
