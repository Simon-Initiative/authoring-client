import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS } from 'editors/content/utils/content';


import styles from './Definition.styles';

export interface TranslationEditorProps
  extends AbstractContentEditorProps<contentTypes.Translation> {
  onShowSidebar: () => void;
  label: any;
}

export interface TranslationEditorState {

}

@injectSheet(styles)
export default class TranslationEditor
    extends AbstractContentEditor<contentTypes.Translation,
    StyledComponentProps<TranslationEditorProps>, TranslationEditorState> {

  constructor(props) {
    super(props);
  }

  renderSidebar() {
    return (
      <SidebarContent title="Translation" />
    );
  }

  renderToolbar() {
    return (
      <ToolbarGroup label="Translation" highlightColor={CONTENT_COLORS.Translation}/>
    );
  }

  onTranslationEdit(content, src) {
    this.props.onEdit(this.props.model.with({ content }), src);
  }

  renderMain() : JSX.Element {

    const { model, label, classes, className } = this.props;

    return (
      <div className={classNames([classes.translation, className])}>
        <div className={classNames([classes.translationLabel, className])}>{label}</div>
        <div className={classNames([classes.translationContent, className])}>
          <ContentContainer
          {...this.props}
          model={model.content}
          onEdit={this.onTranslationEdit.bind(this)}
          />
        </div>
      </div>
    );
  }

}
