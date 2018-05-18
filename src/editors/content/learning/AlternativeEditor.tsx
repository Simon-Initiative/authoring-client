import * as React from 'react';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { TextInput } from '../common/controls';
import { Maybe } from 'tsmonad';
import {
  Discoverable, DiscoverableId,
} from 'components/common/Discoverable.controller';

import { styles } from './Alternatives.styles';

export interface AlternativeEditorProps
  extends AbstractContentEditorProps<contentTypes.Alternative> {
  onShowSidebar: () => void;
  onDiscover: (id: DiscoverableId) => void;
}

export interface AlternativeEditorState {

}

@injectSheet(styles)
export default class AlternativeEditor
  extends AbstractContentEditor<contentTypes.Alternative,
  StyledComponentProps<AlternativeEditorProps>, AlternativeEditorState> {

  constructor(props) {
    super(props);
  }

  onAltEdit(content, src) {
    const model = this.props.model.with({ content });
    this.props.onEdit(model, src);
  }

  onValueEdit(value: string) {
    const spacesStripped = value.replace(/\s+/g, '');
    const model = this.props.model.with({ value: spacesStripped });
    this.props.onEdit(model, model);
  }

  renderSidebar() {
    const { model, editMode } = this.props;

    return (
      <SidebarContent title={model.value}>
        <SidebarGroup label="Label">
          <Discoverable id={DiscoverableId.AlternativeEditorKey} focusChild>
            <TextInput
              editMode={editMode}
              value={model.value}
              type="text"
              width="100%"
              label=""
              onEdit={this.onValueEdit.bind(this)}
            />
          </Discoverable>
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar() {
    const { onShowSidebar, onDiscover, model } = this.props;

    return (
      <ToolbarGroup label={model.value} columns={5} highlightColor={CONTENT_COLORS.CellData}>
        <ToolbarButton
          onClick={() => {
            onShowSidebar();
            onDiscover(DiscoverableId.AlternativeEditorKey);
          }} size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-align-left"></i></div>
          <div>Key</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {
    const { className, classes, model, parent } = this.props;

    return (
      <div className={classNames([classes.alternative, className])}
        onClick={() => this.props.onFocus(model, parent, Maybe.nothing())}>
        <ContentContainer
          {...this.props}
          model={this.props.model.content}
          onEdit={this.onAltEdit.bind(this)}
        />
      </div>
    );
  }

}
