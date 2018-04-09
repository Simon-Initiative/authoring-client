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
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarDropdown, ToolbarDropdownSize } from 'components/toolbar/ToolbarDropdown';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { Select, TextInput } from '../common/controls';
import AlternatvieEditor from './AlternativeEditor';
import { isFirefox, isEdge, isIE } from 'utils/browser';
import styles from './Alternatives.styles';

export interface AlternativesEditorProps
  extends AbstractContentEditorProps<contentTypes.Alternatives> {
  onShowSidebar: () => void;
}

export interface AlternativesEditorState {

}

// Get the key of the nth element in an ordered map
function getKey(
  index: number, collection:
  Immutable.OrderedMap<string,
    contentTypes.Alternative>) {
  return collection.toArray()[index].guid;
}

/**
 * The content editor for tables.
 */
@injectSheet(styles)
export default class AlternativesEditor
    extends AbstractContentEditor<contentTypes.Alternatives,
    StyledComponentProps<AlternativesEditorProps>, AlternativesEditorState> {
  selectionState: any;

  constructor(props) {
    super(props);

    this.onInsertDefault = this.onInsertDefault.bind(this);
    this.onInsertAlternative = this.onInsertAlternative.bind(this);
    this.onEditAlternative = this.onEditAlternative.bind(this);
    this.onEditDefault = this.onEditDefault.bind(this);
    this.onGroupEdit = this.onGroupEdit.bind(this);
    this.onTitleEdit = this.onTitleEdit.bind(this);

  }

  onGroupEdit(group) {
    const model = this.props.model.with({ group });
    this.props.onEdit(model, model);
  }

  onTitleEdit(title) {
    this.props.onEdit(this.props.model.with({ title }));
  }

  renderSidebar() {
    const { model } = this.props;

    const title = model.title.caseOf({ just: t => t,
      nothing: () => contentTypes.Title.fromText('') });
    const groupText = model.group.caseOf({ just: t => t, nothing: () => '' });

    return (
      <SidebarContent title="Variable Content">
        <SidebarGroup label="Group">
          <TextInput
            width="100%"
            editMode={this.props.editMode}
            value={groupText}
            label=""
            type="text"
            onEdit={this.onGroupEdit.bind(this)} />
        </SidebarGroup>
        <SidebarGroup label="Title">

        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar() {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Table" columns={4} highlightColor={CONTENT_COLORS.Table}>
        <ToolbarButton onClick={() => onShowSidebar()} size={ToolbarButtonSize.Large}>
          <div><i style={{ textDecoration: 'underline' }}>Abc</i></div>
          <div>Title</div>
        </ToolbarButton>
        <ToolbarButton onClick={() => onShowSidebar()} size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-th-list"></i></div>
          <div>Row Style</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }

  onAlternativeEdit(a, src) {

    const model = this.props.model
      .with({ content: this.props.model.content.set(a.guid, a) });

    this.props.onEdit(model, src);
  }

  renderAlternative(alternative: contentTypes.Alternative) {

    const { className, classes } = this.props;

    const value = alternative.value;

    // Passing this fake parent to the CellEditor so that the
    // empty supportedElements causes all Insert Toolbar buttons
    // to be disabled, but allows editing of the cell's attributes

    // For now, we disable duplication, removal, and reordering of cells.
    // This doesn't disable the buttons, though.
    const noManualControl = {
      supportedElements: Immutable.List<string>(),
      onAddNew: (e) => {},
      onEdit: (e, s) => {
        this.onAlternativeEdit(e, s);
      },
      onRemove: (e) => {},
      onDuplicate: (e) => {},
      onMoveUp: (e) => {},
      onMoveDown: (e) => {},
      props: this.props,
    };

    return (
      <li className="nav-item">
        <a className="nav-link" href="#">{value}</a>
      </li>
    );
  }

  insertAt(model, toInsert, index) {
    const arr = model
      .map((v, k) => [k, v])
      .toArray();

    arr.splice(index, 0, [toInsert.guid, toInsert]);

    return Immutable.OrderedMap<string, any>(arr);
  }

  onRemoveAlternative(index: number) {

  }

  onRemoveDefault(index: number) {

  }

  renderDefault(d: contentTypes.Default) {
    return (
      <li className="nav-item">
        <a className="nav-link" href="#">Default</a>
      </li>
    );
  }

  renderMain() : JSX.Element {

    const { className, classes, model, editMode } = this.props;

    const alternatives = model.content.toArray().map((alt) => {
      return this.renderAlternative(alt);
    });

    const renderedDefault = model.default.caseOf({
      just: d => this.renderDefault(d),
      nothing: () => null,
    });

    return (
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <a className="nav-link active" href="#">Active</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="#">Link</a>
        </li>

        <li className="nav-item">
          <a className="nav-link" href="#">Add new...</a>
        </li>
      </ul>
    );
  }

}

