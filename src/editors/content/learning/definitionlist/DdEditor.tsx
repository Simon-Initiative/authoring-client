import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS } from 'editors/content/utils/content';

import './DlEditor.scss';
import { DiscoverableId } from 'types/discoverable';
import { Discoverable, FocusAction } from 'components/common/Discoverable.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { Maybe } from 'tsmonad';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { TextInput } from 'editors/content/common/controls';

export interface DdEditorProps extends AbstractContentEditorProps<contentTypes.Dd> {
  onShowSidebar: () => void;
  onDiscover: (id: DiscoverableId) => void;
  label: any;
}

export interface DdEditorState {

}

export default class DdEditor
  extends AbstractContentEditor<contentTypes.Dd, DdEditorProps, DdEditorState> {

  constructor(props) {
    super(props);

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onDdEdit = this.onDdEdit.bind(this);
  }

  onTitleEdit(title: string) {
    this.props.onEdit(
      this.props.model.with({
        title: title === ''
          ? Maybe.nothing()
          : Maybe.just(title),
      }),
      this.props.model);
  }

  onDdEdit(content, src) {
    this.props.onEdit(this.props.model.with({ content }), src);
  }

  renderSidebar() {
    const { model } = this.props;

    return (
      <SidebarContent title="Definition">
        <SidebarGroup label="Title">
          <Discoverable
            id={DiscoverableId.DdEditorTitle}
            focusChild
            focusAction={FocusAction.Focus}>
            <TextInput width="100%" label=""
              editMode={this.props.editMode}
              value={model.title.valueOr('')}
              type="text"
              onEdit={this.onTitleEdit} />
          </Discoverable>
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar() {
    const { onShowSidebar, onDiscover } = this.props;

    return (
      <ToolbarGroup label="Definition" columns={3}
        highlightColor={CONTENT_COLORS.Dl}>
        <ToolbarButton
          onClick={() => {
            onShowSidebar();
            onDiscover(DiscoverableId.DdEditorTitle);
          }} size={ToolbarButtonSize.Large}>
          <div><i style={{ textDecoration: 'underline' }}>Abc</i></div>
          <div>Title</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {

    const { label, model } = this.props;

    return (
      <div className="definition__wrapper">
      <div className="definition__label">{label}</div>
        <ContentContainer
          {...this.props}
          model={model.content}
          onEdit={this.onDdEdit}
          hideSingleDecorator
        />
      </div>
    );
  }
}
