import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS, getContentIcon, insertableContentTypes } from
  'editors/content/utils/content';
import { Select, TextInput } from 'editors/content/common/controls';
import { TabContainer } from 'editors/content/common/TabContainer';
import AlternativeEditor from 'editors/content/learning/AlternativeEditor';
import { ContentElements, MATERIAL_ELEMENTS } from 'data/content/common/elements';
import { Maybe } from 'tsmonad';
import {
  Discoverable, DiscoverableId,
} from 'components/common/Discoverable.controller';

import { styles } from 'editors/content/learning/Alternatives.styles';

export interface AlternativesEditorProps
  extends AbstractContentEditorProps<contentTypes.Alternatives> {
  onShowSidebar: () => void;
  onDiscover: (id: DiscoverableId) => void;
}

export interface AlternativesEditorState {

}

@injectSheet(styles)
export default class AlternativesEditor
  extends AbstractContentEditor<contentTypes.Alternatives,
  StyledComponentProps<AlternativesEditorProps>, AlternativesEditorState> {

  defaultTabIndex: number;

  constructor(props: AlternativesEditorProps) {
    super(props);

    this.onGroupEdit = this.onGroupEdit.bind(this);
    this.onTitleEdit = this.onTitleEdit.bind(this);

    const findIndexOfValue = (value: string) => {
      const arr = props.model.content.toArray();
      for (let i = 0; i < arr.length; i += 1) {
        if (arr[i].value === value) {
          return i;
        }
      }
      return 0;
    };

    // Initially display the default alternative as the selected
    // tab.  If no matching default, display first tab.
    this.defaultTabIndex = props.model.default.caseOf({
      just: d => findIndexOfValue(d.content),
      nothing: () => 0,
    });

  }

  onGroupEdit(group) {
    const model = this.props.model.with({ group: Maybe.just(group) });
    this.props.onEdit(model, model);
  }

  onTitleEdit(title) {
    this.props.onEdit(this.props.model.with({ title }));
  }

  renderSidebar() {
    const { model } = this.props;

    const groupText = model.group.caseOf({ just: t => t, nothing: () => '' });

    const def = model.default.caseOf({
      just: d => d.content,
      nothing: () => '',
    });

    const options = model.content.toArray().map((a) => {
      return <option value={a.value}>{a.value}</option>;
    });

    return (
      <SidebarContent title="Variable Content">
        <SidebarGroup label="Group">
          <Discoverable id={DiscoverableId.AlternativesEditorGroup} focusChild>
            <TextInput
              width="100%"
              editMode={this.props.editMode}
              value={groupText}
              label=""
              type="text"
              onEdit={this.onGroupEdit.bind(this)} />
          </Discoverable>
        </SidebarGroup>
        <SidebarGroup label="Default">
          <Discoverable id={DiscoverableId.AlternativesEditorDefault} focusChild>
            <Select
              editMode={this.props.editMode}
              value={def}
              label=""
              onChange={this.onDefaultChange.bind(this)}>
              <option value=""></option>
              {options}
            </Select>
          </Discoverable>
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar() {
    const { onShowSidebar, onDiscover } = this.props;

    return (
      <ToolbarGroup label="Variable Content" columns={6}
        highlightColor={CONTENT_COLORS.Alternatives}>
        <ToolbarButton onClick={this.onAlternativeAdd.bind(this)} size={ToolbarButtonSize.Large}>
          <div>{getContentIcon(insertableContentTypes.Alternative)}</div>
          <div>Add New</div>
        </ToolbarButton>
        <ToolbarLayout.Column>
          <ToolbarButton
            onClick={() => {
              onShowSidebar();
              onDiscover(DiscoverableId.AlternativesEditorGroup);
            }} size={ToolbarButtonSize.Wide}>
            <i className="fas fa-layer-group" /> Group
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              onShowSidebar();
              onDiscover(DiscoverableId.AlternativesEditorDefault);
            }} size={ToolbarButtonSize.Wide}>
            <i className="far fa-check-square" /> Default
          </ToolbarButton>
        </ToolbarLayout.Column>
      </ToolbarGroup>
    );
  }

  onAlternativeEdit(a: contentTypes.Alternative, src) {

    // If the value has been edited, sync that content into the title
    const previous = this.props.model.content.get(a.guid);
    const updated = a.value === previous.value
      ? a
      : a.with({ title: contentTypes.Title.fromText(a.value) });

    // Ignore the edit if it would result in multiple alternatives
    // having the same value
    if (this.props.model.content.find(
      alt => updated.guid !== alt.guid && updated.value === alt.value)) {
      return;
    }

    // Make sure if we have edited the value of the default that
    // we also change the default
    const original = this.props.model.content.get(updated.guid);
    const def = this.props.model.default.caseOf({
      just: (d) => {
        return d.content === original.value
          ? Maybe.just(d.with({ content: updated.value }))
          : this.props.model.default;
      },
      nothing: () => this.props.model.default,
    });

    const model = this.props.model
      .with({
        content: this.props.model.content.set(updated.guid, updated),
        default: def,
      });

    this.props.onEdit(model, src);
  }

  onAlternativeRemove(a) {

    // Do not allow removal of last two alts, this enforces
    // a DTD constraint
    if (this.props.model.content.size <= 2) {
      return;
    }

    // If the alt removed was the default, remove the default
    const def = this.props.model.default.caseOf({
      just: (d) => {
        return d.content === a
          ? Maybe.nothing<contentTypes.Default>()
          : this.props.model.default;
      },
      nothing: () => this.props.model.default,
    });

    const model = this.props.model
      .with({
        content: this.props.model.content.delete(a.guid),
        default: def,
      });

    this.setState(
      { displayedAlternative: Maybe.just(model.content.first().guid) },
      () => this.props.onEdit(model, model));
  }

  onAlternativeAdd() {

    // Generate a default value for the variant, ensuring we can
    // never have duplicates.
    let ordinal = this.props.model.content.size + 1;
    let value = 'Item-' + ordinal;
    while (this.props.model.content.find(c => c.value === value) !== undefined) {
      ordinal += 1;
      value = 'Item-' + ordinal;
    }

    const a = new contentTypes.Alternative().with({
      value,
      title: contentTypes.Title.fromText(value),
      content: ContentElements.fromText('', '', MATERIAL_ELEMENTS),
    });

    const model = this.props.model
      .with({
        content: this.props.model.content.set(a.guid, a),
      });

    this.props.onEdit(model, a);
  }

  getSubstituteParent() {
    // Passing this fake parent to the AlternativeEditor so that the
    // empty supportedElements causes all Insert Toolbar buttons
    // to be disabled, but allows editing of the child attributes
    return {
      supportedElements: Immutable.List<string>(),
      onAddNew: (e) => { },
      onEdit: (e, s) => {
        this.onAlternativeEdit(e, s);
      },
      onRemove: (e) => {
        this.onAlternativeRemove(e);
      },
      onPaste: (e) => {
        const clone = e.clone().with({
          value: 'Duplicate of ' + e.value,
        });
        const model = this.props.model.with({
          content: this.props.model.content.set(clone.guid, clone),
        });
        this.props.onEdit(model, model);
      },
      onDuplicate: (e) => {
        const clone = e.clone().with({
          value: 'Duplicate of ' + e.value,
        });
        const model = this.props.model.with({
          content: this.props.model.content.set(clone.guid, clone),
        });
        this.props.onEdit(model, model);
      },
      onMoveUp: (e) => { },
      onMoveDown: (e) => { },
      props: this.props,
    };

  }

  onDefaultChange(content) {

    if (content === '') {
      const def = Maybe.nothing<contentTypes.Default>();
      const updated = this.props.model.with({ default: def });
      this.props.onEdit(updated, updated);
    } else {

      const def = this.props.model.default.caseOf({
        just: d => Maybe.just(d.with({ content })),
        nothing: () => Maybe.just(new contentTypes.Default().with({ content })),
      });
      const updated = this.props.model.with({ default: def });
      this.props.onEdit(updated, updated);
    }

  }

  renderAlternative(
    alternative: contentTypes.Alternative,
    maybeDefault: Maybe<contentTypes.Default>) {

    return (
      <AlternativeEditor
        {...this.props}
        parent={this.getSubstituteParent()}
        model={alternative}
        onEdit={this.onAlternativeEdit.bind(this)}
      />
    );
  }

  onTabSelect(index: number) {

    this.props.onFocus(
      this.props.model.content.toArray()[index],
      this.getSubstituteParent(), Maybe.nothing());

  }

  renderEmpty() {
    return (
      <div>
        Click 'Add new' to insert content
      </div>
    );
  }

  renderMain(): JSX.Element {

    const { className, classes, model } = this.props;

    if (model.content.size === 0) {
      return this.renderEmpty();
    }

    const tabLabels = model.content.toArray().map(a => a.value);

    return (
      <div className={classNames([classes.alternatives, className])}>
        <TabContainer
          labels={tabLabels}
          onTabSelect={this.onTabSelect.bind(this)}
          defaultTabIndex={this.defaultTabIndex}>
          {this.props.model.content.toArray().map(
            a => this.renderAlternative(a, this.props.model.default))}
        </TabContainer>
      </div>
    );
  }

}

