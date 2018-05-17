import * as React from 'react';
import { JSSProps } from 'styles/jss';
import * as contentTypes from 'data/contentTypes';

import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { Select } from '../common/controls';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS } from 'editors/content/utils/content';

export interface SymEditorProps extends AbstractContentEditorProps<contentTypes.Sym> {
  onShowSidebar: () => void;
}

export interface SymEditorState {

}

/**
 * React Component
 */
export default class SymEditor
  extends AbstractContentEditor<contentTypes.Sym, SymEditorProps & JSSProps, SymEditorState> {

  constructor(props) {
    super(props);
  }

  renderMain() {
    return null;
  }

  renderSidebar() {
    const { editMode, model, onEdit } = this.props;

    return (
      <SidebarContent title="Symbol">

        <SidebarGroup label="Symbol">
          <Select
            editMode={editMode}
            value={model.name}
            onChange={name =>
              onEdit(model.with({ name }))}>
            <option value="amp">amp</option>
            <option value="mdash">mdash</option>
            <option value="equals">equals</option>
            <option value="ne">ne</option>
            <option value="lt">lt</option>
            <option value="le">le</option>
            <option value="gt">gt</option>
            <option value="ge">ge</option>
            <option value="larr">larr</option>
            <option value="lArr">lArr</option>
            <option value="lrarr">lrarr</option>
            <option value="lrhar">lrhar</option>
            <option value="rarr">rarr</option>
            <option value="rArr">rArr</option>
            <option value="rlarr">rlarr</option>
            <option value="Vbar">Vbar</option>
            <option value="oslash">oslash</option>
            <option value="not_indep">not_indep</option>
            <option value="set_by_interv">set_by_interv</option>
          </Select>
        </SidebarGroup>

      </SidebarContent>
    );
  }

  renderToolbar() {
    return (
      <ToolbarGroup
        label="Symbol"
        highlightColor={CONTENT_COLORS.Sym}
        columns={3}>

      </ToolbarGroup>
    );
  }
}
