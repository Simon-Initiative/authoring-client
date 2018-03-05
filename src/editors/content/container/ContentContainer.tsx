import * as React from 'react';
import * as Immutable from 'immutable';
import { getEditorByContentType } from './registry';
import { ContentElements } from 'data/content/common/elements';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { ContentDecorator } from './ContentDecorator';

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

  onAddNew(toAdd) {
    const { onEdit, model } = this.props;
    onEdit(model.with({ content: model.content.set(toAdd.guid, toAdd) }), toAdd);
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

  render() : JSX.Element {
    console.log('render container: ' + this.props.activeContentGuid);

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
            isActiveContent={model.guid === this.props.activeContentGuid}
            onRemove={this.onRemove.bind(this, model)}
            onFocus={this.props.onFocus.bind(undefined, model, this)}>

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



