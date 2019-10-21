import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { Select } from 'editors/content/common/controls';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { localeCodes, LocaleCode } from 'data/content/learning/foreign';
import { Maybe } from 'tsmonad';

export interface Props extends AbstractContentEditorProps<contentTypes.Foreign> {
  onShowSidebar: () => void;
}

export interface State { }

export default class ForeignEditor
  extends AbstractContentEditor<contentTypes.Foreign, Props, State> {

  renderMain() {
    return null;
  }

  renderToolbar() {
    return null;
  }

  renderSidebar() {
    const { editMode, model, onEdit } = this.props;

    const option = ([code, friendly]) => <option value={code}>{friendly}</option>;

    return (
      <SidebarContent title="Foreign">
        <SidebarGroup label="Language">
          <Select
            editMode={editMode}
            value={model.lang.valueOr('Default')}
            onChange={lang => onEdit(model.with({
              lang: lang === 'Default'
                ? Maybe.nothing()
                : Maybe.just(lang as LocaleCode),
            }))}>
            {Object.entries(localeCodes).map(option)}
          </Select>
        </SidebarGroup>

      </SidebarContent>
    );
  }
}
