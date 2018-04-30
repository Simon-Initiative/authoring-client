import * as React from 'react';
import * as Immutable from 'immutable';
import { getEditorByContentType } from './registry';
import { ContentElements } from 'data/content/common/elements';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { ContentDecorator } from './ContentDecorator.controller';
import { ContiguousText } from 'data/content/learning/contiguous';
import { ContentElement } from 'data/content/common/interfaces';
import { Maybe } from 'tsmonad';
import { TextSelection } from 'types/active';
import guid from 'utils/guid';

import './ContentContainer.scss';

export type BoundProperty = {
  propertyName: string,
  value: any,
};

export enum Layout {
  Vertical,
  Horizontal,
}

export interface ContentContainerProps
    extends AbstractContentEditorProps<ContentElements> {
  hideContentLabel?: boolean;
  bindProperties?: (element: ContentElement) => BoundProperty[];
  activeContentGuid: string;
  hideSingleDecorator?: boolean;
  layout?: Layout;
}

export interface ContentContainerState {

}

export function indexOf(guid: string, model: ContentElements) : number {
  let index = -1;
  const arr = model.content.toArray();
  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i].guid === guid) {
      index = i;
      break;
    }
  }
  return index;
}


/**
 * The content container editor.
 */
export class ContentContainer
  extends AbstractContentEditor<ContentElements,
    ContentContainerProps, ContentContainerState> {

  textSelections: Immutable.Map<string, any>;
  supportedElements: Immutable.List<string>;
  placeholder: Immutable.OrderedMap<string, ContentElement>;

  constructor(props) {
    super(props);

    this.onChildEdit = this.onChildEdit.bind(this);
    this.onSelect = this.onSelect.bind(this);

    this.supportedElements = this.props.model.supportedElements;
    this.textSelections = Immutable.Map<string, any>();
    const placeholderText = ContiguousText.fromText('', guid());
    this.placeholder = Immutable.OrderedMap<string, ContentElement>()
      .set(placeholderText.guid, placeholderText);
  }

  shouldComponentUpdate(nextProps: ContentContainerProps) {
    return this.props.model !== nextProps.model
      || this.props.context !== nextProps.context
      || this.props.activeContentGuid !== nextProps.activeContentGuid
      || this.props.hover !== nextProps.hover;
  }

  onEdit(childModel) {
    this.onChildEdit(childModel, childModel);
  }

  insertAt(model, toInsert, index) {
    const arr = model.content
      .map((v, k) => [k, v])
      .toArray();

    arr.splice(index, 0, [toInsert.guid, toInsert]);

    return model.with({ content: Immutable.OrderedMap<string, ContentElement>(arr) });
  }

  insertAfter(model, toInsert, index) {
    return this.insertAt(model, toInsert, index + 1);
  }

  onAddNew(toAdd, textSelection: Maybe<TextSelection>) {
    const { onEdit, model, activeContentGuid } = this.props;

    // The following defines the insertion logic

    if (model.content.has(activeContentGuid)) {

      const index = indexOf(activeContentGuid, model);
      const active = model.content.get(activeContentGuid);

      if (active instanceof ContiguousText) {

        const selection = textSelection.caseOf({
          just: s => s,
          nothing: () => TextSelection.createEmpty(active.content.getFirstBlock().key),
        });

        // We replace the text when it is effectively empty
        if (active.isEffectivelyEmpty()) {
          const updated : ContentElements = this.insertAfter(model, toAdd, index);
          onEdit(updated.with({ content: updated.content.delete(activeContentGuid) }), toAdd);

        // We insert after when the cursor is at the end
        } else if (active.isCursorAtEffectiveEnd(selection)) {
          onEdit(this.insertAfter(model, toAdd, index), toAdd);

        // If it is at the beginning, insert the new item before the text
        } else if (active.isCursorAtBeginning(selection)) {
          onEdit(this.insertAfter(model, toAdd, index - 1), toAdd);

        // Otherwise we split the contiguous block in two parts and insert in between
        } else {
          const pair = active.split(selection);
          let updated = model.with({ content: model.content.set(pair[0].guid, pair[0]) });
          updated = this.insertAfter(updated, toAdd, index);
          updated = this.insertAfter(updated, pair[1], index + 1);
          onEdit(updated, toAdd);
        }

      } else {
        onEdit(this.insertAfter(model, toAdd, index), toAdd);
      }

    } else {
      // If somehow the active selected item isn't in this ContentElements, we
      // still want to support addition of the new element.  Just insert it at the end
      onEdit(model.with({ content: model.content.set(toAdd.guid, toAdd) }), toAdd);
    }

    this.onSelect(toAdd);
  }

  onChildEdit(childModel, sourceObject) {
    // When childModel is the placeholder, it will simply be added to the model
    const { onEdit, model } = this.props;
    onEdit(model.with({ content: model.content.set(childModel.guid, childModel) }), sourceObject);
  }

  onRemove(childModel) {
    const { onEdit, model } = this.props;

    if (model.content.has(childModel.guid)) {

      const updated = model.with({ content: model.content.delete(childModel.guid) });

      const indexOf = model.content.toArray().map(c => c.guid).indexOf(childModel.guid);
      let newSelection = null;
      if (model.content.size > 1) {
        newSelection = indexOf === 0
          ? updated.content.first()
          : model.content.toArray()[indexOf - 1];
      }

      onEdit(updated, newSelection);

      if (newSelection !== null) {
        this.onSelect(newSelection);
      }
    }
  }

  onPaste(item, textSelection: Maybe<TextSelection>) {
    const { onEdit, model, activeContentGuid } = this.props;
    const duplicate = (item.clone() as any).with({
      guid: guid(),
    });
    const index = indexOf(activeContentGuid, model);
    onEdit(this.insertAfter(model, duplicate, index), duplicate);
    this.onSelect(duplicate);
    // Ask Darren - do we want to keep this logic to split CTEs?
    // this.onAddNew(duplicate, textSelection);
  }

  onDuplicate(childModel) {
    const { onEdit, model, activeContentGuid } = this.props;
    if (model.content.has(childModel.guid)) {
      const index = indexOf(activeContentGuid, model);
      const active = model.content.get(activeContentGuid);

      const duplicate = (active.clone() as any).with({
        guid: guid(),
      });

      onEdit(this.insertAfter(model, duplicate, index), duplicate);

      this.onSelect(duplicate);
    }
  }

  onMoveUp(childModel) {
    const { onEdit, model, activeContentGuid } = this.props;

    if (model.content.has(childModel.guid)) {
      const index = indexOf(activeContentGuid, model);

      const newModel = model.with({
        content: model.content.delete(childModel.guid)});

      onEdit(this.insertAt(newModel, childModel, (Math.max(index - 1, 0))), childModel);
    }
  }

  onMoveDown(childModel) {
    const { onEdit, model, activeContentGuid } = this.props;

    if (model.content.has(childModel.guid)) {
      const index = indexOf(activeContentGuid, model);

      const newModel = model.with({
        content: model.content.delete(childModel.guid)});

      onEdit(
        this.insertAt(
          newModel, childModel, (Math.min(index + 1, newModel.content.size))),
        childModel);
    }
  }

  onSelect(model) {
    const { onFocus } = this.props;

    if (model.contentType === 'ContiguousText') {
      const currentTextSelection = Maybe.just(this.textSelections.get(model.guid)
        || new TextSelection(model.content.selectionAfter));
      return onFocus(model, this, currentTextSelection);
    }

    return onFocus(model, this, Maybe.nothing());
  }

  renderSidebar() {
    return null;
  }

  renderToolbar() {
    return null;
  }

  handleOnClick(e) {
    e.stopPropagation();
  }

  renderMain() : JSX.Element {
    const { hideContentLabel, hover,
      hideSingleDecorator = false,
      onUpdateHover, layout = Layout.Vertical } = this.props;

    const bindProperties = this.props.bindProperties === undefined
      ? element => []
      : this.props.bindProperties;

    // We want this component to display a ContiguousTextEditor in the
    // case where there is no content at all in the model
    const contentOrPlaceholder = this.props.model.content.size === 0
      ? this.placeholder
      : this.props.model.content;

    const hideDecorator = hideSingleDecorator && contentOrPlaceholder.size === 1;

    const countForSizing = Math.max(1, Math.min(contentOrPlaceholder.size, 10));

    const editors = contentOrPlaceholder
      .toArray()
      .map((model) => {

        const props = {
          ...this.props, model,
          onEdit: this.onChildEdit,
          parent: this,
          key: model.guid,
          onTextSelectionChange: s =>  this.textSelections = this.textSelections.set(model.guid, s),
        };

        bindProperties(model).forEach(p => props[p.propertyName] = p.value);

        const childRenderer = React.createElement(
            getEditorByContentType((model as any).contentType), props);

        const isHoverContent = (hover === model.guid);
        const isActiveContent = (model.guid === this.props.activeContentGuid);


        const decoratorClassNames = layout === Layout.Horizontal
          ? 'decorator-horizontal-' + countForSizing : '';

        return hideDecorator
          ? childRenderer
          : (
            <ContentDecorator
              contentType={model.contentType}
              onSelect={() => this.onSelect(model)}
              hideContentLabel={hideContentLabel}
              key={model.guid}
              onMouseOver={() => onUpdateHover && onUpdateHover(model.guid) }
              isHoveringContent={isHoverContent}
              isActiveContent={isActiveContent}
              className={decoratorClassNames}
              onRemove={this.onRemove.bind(this, model)}>

              {childRenderer}

            </ContentDecorator>
          );
      });

    const classNames = layout === Layout.Horizontal ? 'layout-horizontal' : '';
    const classes = 'content-container ' + classNames;
    return (
      <div className={classes}
        onMouseOver={() => onUpdateHover && onUpdateHover(null)}>
        {editors}
      </div>
    );
  }

}



