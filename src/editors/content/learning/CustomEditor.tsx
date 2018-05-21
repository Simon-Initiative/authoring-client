import * as React from 'react';
import * as Immutable from 'immutable';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames } from 'styles/jss';
import { Custom } from 'data/content/assessment/custom';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { DynaDragDropEditor } from './dynadragdrop/DynaDragDropEditor.controller';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { SidebarGroup, SidebarRow } from 'components/sidebar/ContextAwareSidebar';
import { TextInput } from '../common/TextInput';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { Select } from '../common/Select';
import {
  Discoverable, DiscoverableId,
} from 'components/common/Discoverable.controller';

import { styles } from './CustomEditor.styles';

export interface CustomEditorProps extends AbstractContentEditorProps<Custom> {
  onShowSidebar: () => void;
  onDiscover: (id: DiscoverableId) => void;
}

export interface CustomEditorState {

}

@injectSheet(styles)
export class CustomEditor
  extends AbstractContentEditor<Custom,
    StyledComponentProps<CustomEditorProps>, CustomEditorState> {

  constructor(props) {
    super(props);
  }

  renderSidebar(): JSX.Element {
    const { editMode, model, onEdit } = this.props;

    return (
      <SidebarContent title="Custom">
        <SidebarGroup>
          <SidebarRow label="Type">
            <Discoverable id={DiscoverableId.CustomEditorDetails} focusChild>
              <Select label=""
                editMode={editMode}
                value={model.type}
                onChange={value => onEdit(model.with({ type: value }))}>
                <option value="javascript">javascript</option>
                <option value="flash">flash</option>
              </Select>
            </Discoverable>
          </SidebarRow>
          <SidebarRow label="Layout File">
            <TextInput
              editMode={editMode}
              value={model.layout}
              type="text"
              width="100%"
              label=""
              onEdit={value => onEdit(model.with({ layout: value }))} />
          </SidebarRow>
          <SidebarRow label="Source File">
            <TextInput
              editMode={editMode}
              value={model.src}
              type="text"
              width="100%"
              label=""
              onEdit={value => onEdit(model.with({ src: value }))} />
          </SidebarRow>
          <SidebarRow label="Width">
            <TextInput
              editMode={editMode}
              value={`${model.width}`}
              type="number"
              width="100%"
              label=""
              onEdit={value => onEdit(model.with({ width: +value }))} />
          </SidebarRow>
          <SidebarRow label="Height">
            <TextInput
              editMode={editMode}
              value={`${model.height}`}
              type="number"
              width="100%"
              label=""
              onEdit={value => onEdit(model.with({ height: +value }))} />
          </SidebarRow>
          <SidebarRow label="Logging">
            <ToggleSwitch
              {...this.props}
              checked={model.logging}
              onClick={() => onEdit(model.with({ logging: !model.logging }))}
              labelBefore="Enabled" />
          </SidebarRow>
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar(): JSX.Element {
    const { onShowSidebar, onDiscover } = this.props;

    return (
      <ToolbarGroup label="Custom" highlightColor={CONTENT_COLORS.Custom} columns={3}>
        <ToolbarButton
          onClick={() => {
            onShowSidebar();
            onDiscover(DiscoverableId.CustomEditorDetails);
          }} size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-sliders" /></div>
          <div>Details</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }

  renderMain() : JSX.Element {
    const { className, classes, model } = this.props;

    return (
      <div className={classNames([classes.customEditor, className])}>
        {model.src.substr(model.src.length - 11) === 'DynaDrop.js'
          ? <DynaDragDropEditor {...this.props} />
          : (
            <div className={classes.customEditorOther}>
              Custom Element
            </div>
          )
        }
      </div>
    );
  }
}
