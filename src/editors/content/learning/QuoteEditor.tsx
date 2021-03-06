import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { Maybe } from 'tsmonad';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { TextInput } from 'editors/content/common/controls';

import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup, SidebarRow } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';

export interface QuoteEditorProps
  extends AbstractContentEditorProps<contentTypes.Quote> {
  onShowSidebar: () => void;
}

export interface QuoteEditorState {

}

/**
 * React Component
 */
export default class QuoteEditor
  extends AbstractContentEditor
  <contentTypes.Quote, QuoteEditorProps, QuoteEditorState> {

  constructor(props) {
    super(props);
  }

  renderSidebar() {
    const { model, onEdit, editMode } = this.props;

    return (
      <SidebarContent title="Quote">
        <SidebarGroup label="">
          <SidebarRow label="Entry">
            <TextInput
              editMode={editMode}
              width="100%"
              label=""
              value={model.entry.caseOf({ just: n => n, nothing: () => '' })}
              type="string"
              onEdit={e => onEdit(model.with({ entry: Maybe.just(e) }))}
            />
          </SidebarRow>
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar() {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Quote" columns={2.8} highlightColor={CONTENT_COLORS.BlockQuote}>
        <ToolbarButton onClick={onShowSidebar} size={ToolbarButtonSize.Large}>
          <div><i className="fas fa-sliders-h" /></div>
          <div>Details</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }

  renderMain() {
    return null;
  }
}
