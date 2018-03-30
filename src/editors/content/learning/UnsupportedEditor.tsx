import * as React from 'react';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import PreformattedTextEditor from './PreformattedTextEditor';
import './Unsupported.scss';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';

const beautify = require('json-beautify');

export interface UnsupportedEditorProps extends AbstractContentEditorProps<{}> {

}

export interface UnsupportedEditorState {

}

export default class UnsupportedEditor
  extends AbstractContentEditor<{}, UnsupportedEditorProps, UnsupportedEditorState> {

  constructor(props) {
    super(props);

    this.onEdit = this.onEdit.bind(this);
  }

  shouldComponentUpdate() {
    return false;
  }

  onEdit(data) {
    // Editing is disabled
  }

  renderSidebar() {
    return (
      <SidebarContent title="Unsupported">
        <SidebarGroup label="">
          This is an unsupported element.
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar() {
    return (
      <ToolbarGroup label="Unsupported" />
    );
  }

  renderMain() : JSX.Element {
    return (
      <PreformattedTextEditor
        editMode={false}
        onEdit={this.onEdit}
        src={beautify(this.props.model, null, 2, 100)}
        styleName="Unsupported-style"/>
    );
  }
}
