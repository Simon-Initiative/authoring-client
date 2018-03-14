import * as React from 'react';

import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';

import './TitleContentEditor.scss';

export interface TitleContentEditorProps extends AbstractContentEditorProps<contentTypes.Title> {
  styles?: Object;
}

export class TitleContentEditor
  extends AbstractContentEditor<contentTypes.Title, TitleContentEditorProps, {}> {

  constructor(props) {
    super(props);

  }

  onTitleEdit(text, source) {
    const updatedContent = this.props.model.with({ text });
    this.props.onEdit(updatedContent, source);
  }

  renderSidebar() {
    return null;
  }
  renderToolbar() {
    return null;
  }

  renderMain() : JSX.Element {
    return <ContentContainer
      {...this.props}
      model={this.props.model.text}
      onEdit={this.onTitleEdit.bind(this)}
    />;
  }

}
