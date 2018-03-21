import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import * as numbering from 'utils/numbering';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { ContentElements } from 'data/content/common/elements';
import { ToolbarContentContainer } from 'editors/content/container/ToolbarContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { Select, TextInput } from '../common/controls';
import { Maybe } from 'tsmonad';

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

    const style = this.props.model.style.caseOf({
      just: s => s,
      nothing: () => '',
    });

    const start = this.props.model.start.caseOf({
      just: s => s,
      nothing: () => '',
    });

    return (
      <SidebarContent title="Ordered List">
        <SidebarGroup label="Title">
          <ToolbarContentContainer
            onFocus={() => {}}
            context={this.props.context}
            services={this.props.services}
            editMode={this.props.editMode}
            activeContentGuid={null}
            hover={null}
            onUpdateHover={() => {}}
            model={title.text}
            onEdit={this.onTitleEdit.bind(this)} />
        </SidebarGroup>
        <SidebarGroup label="Style">
          <Select
            editMode={this.props.editMode}
            label=""
            value={style}
            onChange={this.onStyleChange.bind(this)}>
            <option value=""></option>
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
        </SidebarGroup>
        <SidebarGroup label="Start">
          <TextInput
            editMode={this.props.editMode}
            label=""
            value={start}
            type="number"
            width="100%"
            onEdit={this.onStartChange.bind(this)}>

          </TextInput>
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

  onStartChange(s) {
    const start = s === ''
      ? Maybe.nothing()
      : Maybe.just(s);

    this.props.onEdit(this.props.model.with({ start }));
  }

  renderToolbar() {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Ordered List" columns={8} highlightColor={CONTENT_COLORS.Ol}>
        <ToolbarButton onClick={() => onShowSidebar()} size={ToolbarButtonSize.Large}>
          <div><i style={{ textDecoration: 'underline' }}>Abc</i></div>
          <div>Title</div>
        </ToolbarButton>
        <ToolbarButton onClick={() => onShowSidebar()} size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-list-ol"></i></div>
          <div>Style</div>
        </ToolbarButton>
        <ToolbarButton onClick={() => onShowSidebar()} size={ToolbarButtonSize.Large}>
          <div><i style={{ textDecoration: 'underline' }}>1.</i></div>
          <div>Start</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }

  onListItemAdd() {

    const listItem = new contentTypes.Li();
    const model = this.props.model.with({
      listItems: this.props.model.listItems.set(listItem.guid, listItem),
    });

    this.props.onEdit(model, listItem);
  }

  onListItemsEdit(elements, src) {

    const items = elements
      .content
      .toArray()
      .map(e => [e.guid, e]);

    const model = this.props.model.with({
      listItems: Immutable.OrderedMap<string, contentTypes.Li>(items),
    });

    this.props.onEdit(model, src);
  }

  renderMain() : JSX.Element {

    const { className, classes, model } = this.props;
    const { style } = model;

    const totalItems = model.listItems.size;

    const actualStyle = style.caseOf({ just: s => s, nothing: () => 'decimal' });

    const start = this.props.model.start.caseOf({
      just: s => Math.max(parseInt(s, 10), 1),
      nothing: () => 1,
    });

    const getLabel = (e, i) => {
      const value = i + start;
      switch (actualStyle) {
        case 'none':
          return '';
        case 'decimal':
          return numbering.asDecimal(value);
        case 'decimal-leading-zero':
          return numbering.asDecimalLeadingZero(value, totalItems);
        case 'lower-roman':
          return numbering.asLowerRoman(value);
        case 'upper-roman':
          return numbering.asUpperRoman(value);
        case 'lower-alpha':
        case 'lower-latin':
          return numbering.asLowerAlpha(value);
        case 'upper-alpha':
        case 'upper-latin':
          return numbering.asUpperAlpha(value);
      }
    };

    const elements = new ContentElements().with({
      content: model.listItems,
    });

    const labels = {};
    model.listItems.toArray().map((e, i) => {
      labels[e.guid]
        = <span style={ { display: 'inline-block', minWidth: '12px' } }>{getLabel(e, i)}</span>;
    });

    const bindLabel = el => [{ propertyName: 'label', value: labels[el.guid] }];

    return (
      <div className={classNames([classes.list, className])}>
        <ContentContainer
          {...this.props}
          model={elements}
          bindProperties={bindLabel}
          onEdit={this.onListItemsEdit.bind(this)}
        />
        <button type="button" onClick={this.onListItemAdd.bind(this)}
          className="btn btn-link">+ Add item</button>
      </div>
    );
  }

}

