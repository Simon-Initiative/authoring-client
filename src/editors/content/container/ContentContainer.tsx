import * as React from 'react';
import * as Immutable from 'immutable';
import { getEditorByContentType } from './registry';
import { ContentElements } from 'data/content/common/elements';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { ContentDecorator } from './ContentDecorator';
import { ContiguousText } from 'data/content/learning/contiguous';
import { ContentElement } from 'data/content/common/interfaces';
import { Maybe } from 'tsmonad';
import { TextSelection } from 'types/active';
import guid from 'utils/guid';

import './ContentContainer.scss';

export interface ContentContainerProps
    extends AbstractContentEditorProps<ContentElements> {
  hideContentLabel?: boolean;
  hover?: string;
  onUpdateHover?: (hover: string) => void;
}

export interface ContentContainerState {

}

function indexOf(guid: string, model: ContentElements) : number {
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
      onEdit(model.with({ content: model.content.delete(childModel.guid) }), childModel);
    }
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
        || model.content.selectionAfter);
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

  renderMain() : JSX.Element {
    const { hideContentLabel, hover, onUpdateHover } = this.props;

    // We want this component to display a ContiguousTextEditor in the
    // case where there is no content at all in the model
    const contentOrPlaceholder = this.props.model.content.size === 0
      ? this.placeholder
      : this.props.model.content;

    const editors = contentOrPlaceholder
      .toArray()
      .map((model) => {
        const props = {
          ...this.props, model,
          onEdit: this.onChildEdit,
          parent: this,
          onTextSelectionChange: s =>  this.textSelections = this.textSelections.set(model.guid, s),
        };

        const childRenderer = React.createElement(
            getEditorByContentType((model as any).contentType), props);

        return (
          <ContentDecorator
            contentType={model.contentType}
            onSelect={() => this.onSelect(model)}
            hideContentLabel={hideContentLabel}
            key={model.guid}
            onMouseOver={() => onUpdateHover && onUpdateHover(model.guid) }
            isHoveringContent={hover === model.guid}
            isActiveContent={model.guid === this.props.activeContentGuid}
            onRemove={this.onRemove.bind(this, model)}>

            {childRenderer}

          </ContentDecorator>
        );
      });

    return (
      <div className="content-container"
        onMouseOver={() => onUpdateHover && onUpdateHover(null)}>
        {editors}
      </div>
    );
  }

}



