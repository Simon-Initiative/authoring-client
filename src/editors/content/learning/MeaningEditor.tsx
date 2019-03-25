import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { withStyles, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS } from 'editors/content/utils/content';

import { styles } from './Definition.styles';

export interface MeaningEditorProps
  extends AbstractContentEditorProps<contentTypes.Meaning> {
  onShowSidebar: () => void;
  label: any;
}

export interface MeaningEditorState {

}

class MeaningEditor
    extends AbstractContentEditor<contentTypes.Meaning,
    StyledComponentProps<MeaningEditorProps, typeof styles>, MeaningEditorState> {

  constructor(props) {
    super(props);
  }

  renderSidebar() {
    return (
      <SidebarContent title="Meaning" />
    );
  }

  renderToolbar() {
    return (
      <ToolbarGroup label="Meaning" highlightColor={CONTENT_COLORS.Meaning}/>
    );
  }

  onMeaningEdit(content, src) {
    const material = this.props.model.material.with({
      content,
    });
    this.props.onEdit(this.props.model.with({ material }), src);
  }

  renderMain() : JSX.Element {

    const { model, label, classes, className } = this.props;

    return (
      <div className={classNames([classes.meaning, className])}>
        <div className={classNames([classes.meaningLabel, className])}>{label}</div>
        <div className={classNames([classes.meaningContent, className])}>
          <ContentContainer
          {...this.props}
          model={model.material.content}
          onEdit={this.onMeaningEdit.bind(this)}
          />
        </div>
      </div>
    );
  }

}

const StyledMeaningEditor = withStyles<MeaningEditorProps>(styles)(MeaningEditor);
export default StyledMeaningEditor;
