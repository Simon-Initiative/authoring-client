import * as React from 'react';
import * as Immutable from 'immutable';
import { getEditorByContentType } from 'editors/content/container/registry';
import { ContentElements } from 'data/content/common/elements';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ContentDecorator } from 'editors/content/container/ContentDecorator';
import { ContiguousText } from 'data/content/learning/contiguous';
import { ContentElement } from 'data/content/common/interfaces';
import { Maybe } from 'tsmonad';
import guid from 'utils/guid';
import './ContentContainer.scss';
import { classNames } from 'styles/jss';
import * as editorUtils from '../learning/contiguoustext/utils';
import { Editor } from 'slate';
import { updateEditor } from 'actions/active';
import { connect } from 'react-redux';

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
  className?: string;
  hideContentLabel?: boolean | string[];
  disableContentSelection?: boolean | string[];
  bindProperties?: (element: ContentElement) => BoundProperty[];
  activeContentGuid: string;
  hideSingleDecorator?: boolean;
  hideAllDecorators?: boolean;
  layout?: Layout;
  selectedEntity?: Maybe<string>;
  overrideRemove?: (model: ContentElements, childModel: Object) => boolean;
  onUpdateEditor: (editor) => void;
}

export interface ContentContainerState {

}

export function indexOf(guid: string, model: ContentElements): number {
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
class ContentContainer
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
      || this.props.selectedEntity !== nextProps.selectedEntity
      || this.props.hover !== nextProps.hover;
  }

  onEdit(childModel) {
    this.onChildEdit(childModel, childModel);
  }

  insertAt(model, toInsert: Object[], index) {
    const arr = model.content
      .map((v, k) => [k, v])
      .toArray();

    toInsert.map(i => [(i as any).guid, i])
      .reverse()
      .forEach(i => arr.splice(index, 0, i));

    return model.with({ content: Immutable.OrderedMap<string, ContentElement>(arr) });
  }

  insertAfter(model, toInsert, index) {
    return this.insertAt(model, toInsert, index + 1);
  }

  onAddNew(toAdd, editor: Maybe<Editor>) {
    const { onEdit, model, activeContentGuid } = this.props;

    // The following defines the insertion logic

    // Support either a scalar or array of elements to add
    const arrToAdd = toAdd instanceof Array
      ? toAdd
      : [toAdd];
    const firstItem = arrToAdd[0];

    if (model.content.has(activeContentGuid)) {

      const index = indexOf(activeContentGuid, model);
      const active = model.content.get(activeContentGuid);

      if (active instanceof ContiguousText) {
        editor.caseOf({
          nothing: () => onEdit(this.insertAfter(model, arrToAdd, index), firstItem),
          just: (e) => {
            // We replace the text when it is effectively empty
            if (editorUtils.isEffectivelyEmpty(e)) {
              const updated: ContentElements = this.insertAfter(model, arrToAdd, index);
              onEdit(updated.with({
                content: updated.content.delete(activeContentGuid),
              }), firstItem);

              // We insert after when the cursor is at the end
            } else if (editorUtils.isCursorAtEffectiveEnd(e)) {
              onEdit(this.insertAfter(model, arrToAdd, index), firstItem);

              // If it is at the beginning, insert the new item before the text
            } else if (editorUtils.isCursorAtBeginning(e)) {
              onEdit(this.insertAfter(model, arrToAdd, index - 1), firstItem);

              // Otherwise we split the contiguous block in two parts and insert in between
            } else {
              const pair = editorUtils.split(e);
              const forcedUpdateCount = active.forcedUpdateCount + 1;
              const first = active.with({ slateValue: pair[0], forcedUpdateCount });
              const second = new ContiguousText({ slateValue: pair[1] });

              let updated = model.with({ content: model.content.set(first.guid, first) });

              updated = this.insertAfter(updated, arrToAdd, index);
              updated = this.insertAfter(updated, [second], index + arrToAdd.length);
              onEdit(updated, firstItem);
            }
          },
        });

      } else {
        onEdit(this.insertAfter(model, arrToAdd, index), firstItem);
      }

    } else {
      // If the active selected item isn't in this ContentElements (this happens when
      // all content in a ContentContainer is deleted and we insert something into the remaining
      // empty ContiguousTextEditor, we still want to support addition of the new element.
      // Just insert it at the end.
      const mapToAdd = Immutable.OrderedMap<string, ContentElement>(
        arrToAdd.map((i: ContentElement) => [i.guid, i]));
      onEdit(model.with({ content: model.content.merge(mapToAdd) }), firstItem);
    }

    this.onSelect(toAdd);
  }

  onChildEdit(childModel, sourceObject) {
    // When childModel is the placeholder, it will simply be added to the model
    const { onEdit, model } = this.props;
    onEdit(model.with({ content: model.content.set(childModel.guid, childModel) }), sourceObject);
  }

  onRemove(childModel) {
    const { onEdit, model, overrideRemove } = this.props;

    // Call overrideRemove, and terminate if it returns true
    if (overrideRemove !== undefined && overrideRemove(model, childModel)) {
      return;
    }

    if (model.content.has(childModel.guid)) {

      const updated = model.with({ content: model.content.delete(childModel.guid) });

      const indexOf = model.content.toArray().map(c => c.guid).indexOf(childModel.guid);
      let newSelection: ContentElement = null;
      if (model.content.size > 1) {
        // Select the next item in the list if available, otherwise select the previous item
        newSelection = indexOf < model.content.size - 1
          ? model.content.toArray()[indexOf + 1]
          : model.content.toArray()[indexOf - 1];
      }

      if (this.disableContentSelection(newSelection)) {
        newSelection = null;
      }

      onEdit(updated, newSelection);

      if (newSelection !== null) {
        this.onSelect(newSelection);
      }
    }
  }

  onPaste(item: ContentElement, editor: Maybe<Editor>) {
    const duplicate: ContentElement = item.clone();
    this.onAddNew(duplicate, editor);
  }

  onDuplicate(childModel) {
    const { onEdit, model, activeContentGuid } = this.props;
    if (model.content.has(childModel.guid)) {
      const index = indexOf(activeContentGuid, model);
      const active = model.content.get(activeContentGuid);

      const duplicate = active.clone() as any;

      onEdit(this.insertAfter(model, duplicate, index), duplicate);

      this.onSelect(duplicate);
    }
  }

  onMoveUp(childModel) {
    const { onEdit, model, activeContentGuid } = this.props;

    if (model.content.has(childModel.guid)) {
      const index = indexOf(activeContentGuid, model);

      const newModel = model.with({
        content: model.content.delete(childModel.guid),
      });

      onEdit(this.insertAt(newModel, [childModel], (Math.max(index - 1, 0))), childModel);
    }
  }

  onMoveDown(childModel) {
    const { onEdit, model, activeContentGuid } = this.props;

    if (model.content.has(childModel.guid)) {
      const index = indexOf(activeContentGuid, model);

      const newModel = model.with({
        content: model.content.delete(childModel.guid),
      });

      onEdit(
        this.insertAt(
          newModel, [childModel], (Math.min(index + 1, newModel.content.size))),
        childModel);
    }
  }

  onSelect(model) {
    const { onFocus, onUpdateEditor } = this.props;

    if (model.contentType === 'ContiguousText') {
      // Reset the active slate editor
      onUpdateEditor(undefined);
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

  disableContentSelection(model: ContentElement) {
    const { disableContentSelection } = this.props;

    return !!(disableContentSelection === true
      || (Array.isArray(disableContentSelection)
        && disableContentSelection.find(type => type === model.contentType)));
  }

  renderMain(): JSX.Element {
    const { hideContentLabel, disableContentSelection, hover,
      hideSingleDecorator = false,
      hideAllDecorators = false,
      onUpdateHover, layout = Layout.Vertical, className } = this.props;

    const bindProperties = this.props.bindProperties === undefined
      ? element => []
      : this.props.bindProperties;

    // We want this component to display a ContiguousTextEditor in the
    // case where there is no content at all in the model
    const contentOrPlaceholder = this.props.model.content.size === 0
      ? this.placeholder
      : this.props.model.content;

    const countForSizing = Math.max(1, Math.min(contentOrPlaceholder.size, 10));

    const editors = contentOrPlaceholder
      .toArray()
      .map((model) => {
        const hideDecorator = hideSingleDecorator && contentOrPlaceholder.size === 1
          || hideAllDecorators
          || this.disableContentSelection(model);

        const props = {
          ...this.props, model,
          onEdit: this.onChildEdit,
          onFocus: this.disableContentSelection(model)
            ? () => { /** do nothing */ }
            : this.props.onFocus,
          parent: this,
          key: model.guid,
          onTextSelectionChange: s => this.textSelections = this.textSelections.set(model.guid, s),
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
              disableContentSelection={disableContentSelection}
              key={model.guid}
              onMouseOver={(e) => {
                if (onUpdateHover) {
                  onUpdateHover(model.guid);
                  e.stopPropagation();
                }
              }}
              isHoveringContent={isHoverContent}
              isActiveContent={isActiveContent}
              className={decoratorClassNames}
              onRemove={this.onRemove.bind(this, model)}>

              {childRenderer}

            </ContentDecorator>
          );
      });

    return (
      <div className={classNames([
        className,
        'content-container',
        layout === Layout.Horizontal ? 'layout-horizontal' : '',
      ])}
        onMouseOver={() => onUpdateHover && onUpdateHover(null)}>
        {editors}
      </div>
    );
  }

}

interface OwnProps extends AbstractContentEditorProps<ContentElements> {
  className?: string;
  hideContentLabel?: boolean | string[];
  disableContentSelection?: boolean | string[];
  bindProperties?: (element: ContentElement) => BoundProperty[];
  activeContentGuid: string;
  hideSingleDecorator?: boolean;
  hideAllDecorators?: boolean;
  layout?: Layout;
  selectedEntity?: Maybe<string>;
  overrideRemove?: (model: ContentElements, childModel: Object) => boolean;
}

interface StateProps { }

interface DispatchProps {
  onUpdateEditor: (editor) => void;
}

const mapStateToProps = (state, ownProps): StateProps => {
  return {};
};

const mapDispatchToProps = (dispatch, ownProps): DispatchProps => {
  return {
    onUpdateEditor: editor => dispatch(updateEditor(editor)),
  };
};

const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(ContentContainer);
export { controller as ContentContainer };
