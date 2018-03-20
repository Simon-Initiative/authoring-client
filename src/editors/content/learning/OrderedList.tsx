import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps, RenderContext,
} from 'editors/content/common/AbstractContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { ToolbarContentContainer } from 'editors/content/container/ToolbarContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { Select } from '../common/controls';
import { Maybe } from 'tsmonad';
import ListItem from './ListItem';
import styles from './List.styles';

export interface OrderedListProps
  extends AbstractContentEditorProps<contentTypes.Ol> {
  onShowSidebar: () => void;
}

export interface OrderedListState {

}

/**
 * The content editor for contiguous text.
 */
@injectSheet(styles)
export default class OrderedList
    extends AbstractContentEditor<contentTypes.Ol,
    StyledComponentProps<OrderedListProps>, OrderedListState> {
  selectionState: any;

  constructor(props) {
    super(props);


  }

  onTitleEdit(text) {

    const title = this.props.model.title.caseOf({
      just: t => Maybe.just(t.with({ text })),
      nothing: () => Maybe.just(new contentTypes.Title().with({ text })),
    });
    this.props.onEdit(this.props.model.with({ title }));
  }

  renderSidebar() {
    const { model } = this.props;

    const title = model.title.caseOf({
      just: t => t,
      nothing: () => contentTypes.Title.fromText(''),
    });

    return (
      <SidebarContent title="Section">
        <SidebarGroup label="Title">
          <ToolbarContentContainer
            onFocus={() => {}}
            context={this.props.context}
            services={this.props.services}
            editMode={this.props.editMode}
            model={title.text}
            onEdit={this.onTitleEdit.bind(this)} />
        </SidebarGroup>
      </SidebarContent>
    );
  }

  onStyleChange(s) {
    const style = s === ''
      ? Maybe.nothing()
      : Maybe.just(s);

    this.props.onEdit(this.props.model.with({ style }));
  }

  renderToolbar() {
    const { onShowSidebar } = this.props;

    const style = this.props.model.style.caseOf({
      just: s => s,
      nothing: () => '',
    });

    return (
      <ToolbarGroup label="Section" columns={8} highlightColor={CONTENT_COLORS.Ol}>
        <ToolbarLayout.Column>
            <div style={{ marginLeft: 8 }}>Style</div>
            <Select
              editMode={this.props.editMode}
              label=""
              value={style}
              onChange={this.onStyleChange}>
              <option value="">''</option>
              <option value="none">None</option>
              <option value="decimal">Decimal</option>
              <option value="decimal-leading-zero">Decimal with leading zero</option>
              <option value="lower-roman">Lowercase Roman numerals</option>
              <option value="upper-roman">Uppercase Roman numerals</option>
              <option value="lower-alpha">Lowercase alpha</option>
              <option value="upper-alpha">Uppercase alpha</option>
              <option value="lower-latin">Lowercase latin</option>
              <option value="upper-latin">Uppercase latin</option>
            </Select>
        </ToolbarLayout.Column>

        <ToolbarButton onClick={() => onShowSidebar()} size={ToolbarButtonSize.Large}>
          <div><i style={{ textDecoration: 'underline' }}>Abc</i></div>
          <div>Title</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }

  onListItemEdit(listItem, src) {

    const model = this.props.model.with({
      listItems: this.props.model.listItems.set(listItem.guid, listItem),
    });

    this.props.onEdit(model, src);
  }

  renderMain() : JSX.Element {

    const { className, classes, model, parent, editMode } = this.props;

    return (
      <div className={classNames([classes.list, className])}>
        {model.listItems.map((listItem) => {
          return <ListItem
            {...this.props}
            model={listItem}
            onEdit={this.onListItemEdit.bind(this)}
          />;
        })}
      </div>
    );
  }

}

