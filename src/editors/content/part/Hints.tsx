import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { ContentElements } from 'data/content/common/elements';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';


export interface HintsProps extends AbstractContentEditorProps<contentTypes.Part> {

}

export interface HintsState {

}

/**
 * The content editor for HtmlContent.
 */
export class Hints
extends AbstractContentEditor<contentTypes.Part,
  HintsProps, HintsState> {

  constructor(props) {
    super(props);

    this.onHintEdit = this.onHintEdit.bind(this);
  }

  onHintEdit(elements, src) {
    const { onEdit } = this.props;

    const items = elements
      .content
      .toArray()
      .map(e => [e.guid, e]);

    const model = this.props.model.with({
      hints: Immutable.OrderedMap<string, contentTypes.Hint>(items),
    });

    onEdit(model, src);
  }

  renderToolbar() {
    return null;
  }

  renderSidebar() {
    return null;
  }

  renderMain() : JSX.Element {

    const elements = new ContentElements().with({
      content: this.props.model.hints,
    });

    const labels = {};
    this.props.model.hints.toArray().map((e, i) => {
      labels[e.guid]
        = <span style={ { display: 'inline-block',
          minWidth: '20px', marginRight: '5px' } }>{'Hint ' + (i + 1)}</span>;
    });

    const bindLabel = el => [{ propertyName: 'label', value: labels[el.guid] }];


    return (
      <div>
        <ContentContainer
          {...this.props}
          model={elements}
          bindProperties={bindLabel}
          onEdit={this.onHintEdit.bind(this)}
        />
      </div>
    );
  }

}

