import * as React from 'react';
import * as Immutable from 'immutable';
import { getEditorByContentType } from './registry';
import { ContentElement } from 'data/content/common/interfaces';
import { ContentElements } from 'data/content/common/elements';

import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';

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


  constructor(props) {
    super(props);

    this.onChildEdit = this.onChildEdit.bind(this);
  }

  onChildEdit(childModel) {
    const { onEdit, model } = this.props;
    onEdit(model.with({ content: model.content.set(childModel.guid, childModel) }));
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.model !== this.props.model) {
      return true;
    }
    if (nextProps.context !== this.props.context) {
      return true;
    }
    return false;
  }

  render() : JSX.Element {

    const editors = this.props.model.content
      .toArray()
      .map((model) => {
        const props = { ...this.props, model, onEdit: this.onChildEdit };
        return React.createElement(getEditorByContentType((model as any).contentType), props);
      });

    return (
      <div className="content-container">
        {editors}
      </div>
    );
  }

}



