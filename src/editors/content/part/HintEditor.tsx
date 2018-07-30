import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import guid from 'utils/guid';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS } from 'editors/content/utils/content';

import './HintEditor.scss';

type IdTypes = {
  targets: string,
};

export interface HintEditorProps extends AbstractContentEditorProps<contentTypes.Hint> {
  label: any;
}

export interface HintEditorState {

}

/**
 * The content editor for HtmlContent.
 */
export default class HintEditor
  extends AbstractContentEditor<contentTypes.Hint, HintEditorProps, HintEditorState> {
  ids: IdTypes;

  constructor(props) {
    super(props);

    this.ids = {
      targets: guid(),
    };
    this.onBodyEdit = this.onBodyEdit.bind(this);
    this.onTargetChange = this.onTargetChange.bind(this);
  }

  onBodyEdit(body, src) {
    const concept = this.props.model.with({ body });
    this.props.onEdit(concept, src);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ targets: nextProps.model.targets });
  }

  onTargetChange(e) {
    const targets = e.target.value;
    this.setState({ targets }, () =>
      this.props.onEdit(this.props.model.with({ targets })));
  }


  renderToolbar() {

    return (
      <ToolbarGroup label="Hint" columns={9} highlightColor={CONTENT_COLORS.Hint}>
      </ToolbarGroup>
    );
  }

  renderSidebar() {

    return (
      <SidebarContent title="Hint">
      </SidebarContent>
    );
  }


  renderMain(): JSX.Element {

    return (
      <div className="itemWrapper hint">
        <div className="hint-label">{this.props.label}</div>
        <div className="hint-content">
          <ContentContainer
            {...this.props}
            model={this.props.model.body}
            onEdit={this.onBodyEdit}
          />
        </div>
      </div>
    );
  }

}

