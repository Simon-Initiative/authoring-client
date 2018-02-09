import * as React from 'react';

import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import {
  getCaretPosition, getSelectionRange, setCaretPosition,
} from '../../content/common/draft/utils';
import { ContentContainer } from 'editors/content/container/ContentContainer';

const BACKSPACE = 8;

export interface TitleContentEditorProps extends AbstractContentEditorProps<contentTypes.Title> {
  styles?: Object;
}

export class TitleContentEditor
  extends AbstractContentEditor<contentTypes.Title, TitleContentEditorProps, {}> {

  constructor(props) {
    super(props);

  }

  shouldComponentUpdate(nextProps) {
    return this.props.model !== nextProps.model;
  }

  onTitleEdit(text) {

    const updatedContent = this.props.model.with({ text });
    this.props.onEdit(updatedContent);

  }

  render() : JSX.Element {
    return <ContentContainer
      {...this.props}
      model={this.props.model.text}
      onEdit={this.onTitleEdit.bind(this)}
    />;
  }

}
