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

import './ContentContainer.scss';

export interface ContentContainerProps
  extends AbstractContentEditorProps<ContentElements> {


}

export interface ContentContainerState {

}

/**
 * The content container editor.
 */
export class ContentContainer
  extends AbstractContentEditor<ContentElements,
    ContentContainerProps, ContentContainerState> {

  supportedElements: Immutable.List<string>;

  constructor(props) {
    super(props);

    this.onChildEdit = this.onChildEdit.bind(this);

    this.supportedElements = this.props.model.supportedElements;
  }

  onEdit(childModel) {
    this.onChildEdit(childModel, childModel);
  }

  insertAfter(model, toInsert, index) {
    const arr = model.content
      .map((v, k) => [k, v])
      .toArray();

    arr.splice(index, 0, [toInsert.guid, toInsert]);

    return model.with({ content: Immutable.OrderedMap<string, ContentElement>(arr) });
  }

  onAddNew(toAdd, textSelection: Maybe<TextSelection>) {
    const { onEdit, model, activeContentGuid } = this.props;

    const selection = textSelection.caseOf({ just: s => s, nothing: () => null });

    if (model.content.has(activeContentGuid)) {

      let index = -1;
      const arr = model.content.toArray();
      for (let i = 0; i < arr.length; i += 1) {
        if (arr[i].guid === activeContentGuid) {
          index = i;
          break;
        }
      }
      const active = model.content.get(activeContentGuid);
      if (active instanceof ContiguousText) {

        const pair = active.split(selection);
        let updated = model.with({ content: model.content.set(pair[0].guid, pair[0]) });
        updated = this.insertAfter(updated, toAdd, index + 1);
        updated = this.insertAfter(updated, pair[1], index + 2);
        onEdit(updated, toAdd);

      } else {
        onEdit(this.insertAfter(model, toAdd, index), toAdd);
      }

    } else {
      onEdit(model.with({ content: model.content.set(toAdd.guid, toAdd) }), toAdd);
    }

  }

  onChildEdit(childModel, sourceObject) {
    const { onEdit, model } = this.props;
    onEdit(model.with({ content: model.content.set(childModel.guid, childModel) }), sourceObject);
  }

  onRemove(childModel) {
    const { onEdit, model } = this.props;
    onEdit(model.with({ content: model.content.delete(childModel.guid) }), childModel);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.activeContentGuid !== this.props.activeContentGuid) {
      return true;
    }
    if (nextProps.model !== this.props.model) {
      return true;
    }
    if (nextProps.context !== this.props.context) {
      return true;
    }
    return false;
  }

  renderSidebar() {
    return null;
  }

  renderToolbar() {
    return null;
  }

  renderMain() : JSX.Element {

    const editors = this.props.model.content
      .toArray()
      .map((model) => {
        const props = {
          ...this.props, model,
          onEdit: this.onChildEdit,
          parent: this,
        };
        const childRenderer = React.createElement(
          getEditorByContentType((model as any).contentType), props);

        return (
          <ContentDecorator
            key={model.guid}
            isActiveContent={model.guid === this.props.activeContentGuid}
            onRemove={this.onRemove.bind(this, model)}>

            {childRenderer}

          </ContentDecorator>
        );
      });

    return (
      <div className="content-container">
        {editors}
      </div>
    );
  }

}



