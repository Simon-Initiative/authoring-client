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

export interface PronunciationEditorProps
  extends AbstractContentEditorProps<contentTypes.Pronunciation> {
  onShowSidebar: () => void;

}

export interface PronunciationEditorState {

}

@injectSheet(styles)
export default class PronunciationEditor
    extends AbstractContentEditor<contentTypes.Pronunciation,
    StyledComponentProps<PronunciationEditorProps>, PronunciationEditorState> {

  constructor(props) {
    super(props);
  }

  renderSidebar() {
    return (
      <SidebarContent title="Pronunciation" />
    );
  }

  renderToolbar() {
    return (
      <ToolbarGroup label="Pronunciation" highlightColor={CONTENT_COLORS.Pronunciation}/>
    );
  }

  onPronunciationEdit(content, src) {
    this.props.onEdit(this.props.model.with({ content }), src);
  }

  renderMain() : JSX.Element {

    const { model, classes, className } = this.props;

    return (
      <div className={classNames([classes.pronunciation, className])}>
        <div className={classNames([classes.pronunciationLabel, className])}>Pronunciation</div>
        <div className={classNames([classes.pronunciationContent, className])}>
          <ContentContainer
          {...this.props}
          model={model.content}
          onEdit={this.onPronunciationEdit.bind(this)}
          />
        </div>
      </div>
    );
  }

}
