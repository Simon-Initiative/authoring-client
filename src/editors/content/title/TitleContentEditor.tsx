import * as React from 'react';

import * as contentTypes from 'data/contentTypes';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';

import './TitleContentEditor.scss';
import { ContentElement } from 'data/content/common/interfaces';
import { ContentElements } from 'data/content/common/elements';
import { JSSStyles } from 'styles/jss';

export interface TitleContentEditorProps extends AbstractContentEditorProps<contentTypes.Title> {
  styles?: JSSStyles;
}

export class TitleContentEditor
  extends AbstractContentEditor<contentTypes.Title, TitleContentEditorProps, {}> {

  onTitleEdit = (text: ContentElements, source: ContentElement) => {
    const updatedContent = this.props.model.with({ text });
    this.props.onEdit(updatedContent, source);
  }

  renderSidebar() {
    return null;
  }
  renderToolbar() {
    return null;
  }

  renderMain(): JSX.Element {
    return <ContentContainer
      {...this.props}
      activeContentGuid={null}
      hover={null}
      onUpdateHover={() => { }}
      model={this.props.model.text}
      onEdit={this.onTitleEdit}
    />;
  }
}
