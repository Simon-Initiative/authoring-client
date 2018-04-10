import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
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
import { Select } from '../common/controls';
import { Maybe } from 'tsmonad';
import { styles } from './List.styles';

export interface UnorderedListEditorProps
  extends AbstractContentEditorProps<contentTypes.Ul> {
  onShowSidebar: () => void;
}

export interface UnorderedListEditorState {

}

/**
 * The content editor for contiguous text.
 */
@injectSheet(styles)
export default class UnorderedList
    extends AbstractContentEditor<contentTypes.Ul,
    StyledComponentProps<UnorderedListEditorProps>, UnorderedListEditorState> {
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

    return (
      <SidebarContent title="Unordered List">
        <SidebarGroup label="Title">
          <ToolbarContentContainer
            onFocus={() => {}}
            activeContentGuid={null}
            hover={null}
            onUpdateHover={() => {}}
            context={this.props.context}
            services={this.props.services}
            editMode={this.props.editMode}
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
            <option value="disc">Disc</option>
            <option value="circle">Circle</option>
            <option value="square">Square</option>
          </Select>
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
      <ToolbarGroup label="Unordered List" columns={4} highlightColor={CONTENT_COLORS.Ul}>
        <ToolbarButton onClick={() => onShowSidebar()} size={ToolbarButtonSize.Large}>
          <div><i style={{ textDecoration: 'underline' }}>Abc</i></div>
          <div>Title</div>
        </ToolbarButton>
        <ToolbarButton onClick={() => onShowSidebar()} size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-list-ul"></i></div>
          <div>Style</div>
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

    const actualStyle = style.caseOf({ just: s => s, nothing: () => 'disc' });

    const getLabel = (e) => {
      switch (actualStyle) {
        case 'none':
          return '';
        case 'disc':
          return <span>{'\u25cf'}</span>;
        case 'circle':
          return <span>{'\u25e6'}</span>;
        case 'square':
          return <span>{'\u25fc'}</span>;
      }
    };

    const elements = new ContentElements().with({
      content: model.listItems,
    });

    const labels = {};
    model.listItems.toArray().map((e) => {
      labels[e.guid] = getLabel(e);
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
