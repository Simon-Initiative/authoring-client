import * as React from 'react';

import { Panopto as PanoptoType } from 'data/content/learning/panopto';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { modalActions } from 'actions/modal';
import { selectFile } from 'editors/content/learning/file';
import { MediaMetadataEditor, MediaWidthHeightEditor } from 'editors/content/learning/MediaItems';
import {
  DiscoverableId,
} from 'components/common/Discoverable.controller';

import './Media.scss';

export interface PanoptoProps extends AbstractContentEditorProps<PanoptoType> {
  onShowSidebar: () => void;
  onDiscover: (id: DiscoverableId) => void;
}

export interface PanoptoState {

}

export default class PanoptoEditor
  extends AbstractContentEditor<PanoptoType, PanoptoProps, PanoptoState> {

  constructor(props) {
    super(props);

    this.onSelect = this.onSelect.bind(this);
  }

  onSelect() {
    const { context, services, onEdit, model } = this.props;

    const dispatch = (services as any).dispatch;
    const dismiss = () => dispatch(modalActions.dismiss());
    const display = c => dispatch(modalActions.display(c));

    selectFile(
      model.src,
      context.resourcePath, context.courseModel,
      display, dismiss)
      .then((src) => {
        if (src !== null) {
          const updated = model.with({ src });
          onEdit(updated, updated);
        }
      });
  }

  renderSidebar(): JSX.Element {

    const src = this.props.model.src;
    const file = src !== ''
      ? src.substr(src.lastIndexOf('/') + 1)
      : 'No file selected';

    return (
      <SidebarContent title="Panopto">

        <SidebarGroup label="Source File">
          <div>{file}</div>
          <ToolbarButton onClick={this.onSelect} size={ToolbarButtonSize.Large}>
            <div><i className="fa fa-file-o" /></div>
            <div>Select File</div>
          </ToolbarButton>
        </SidebarGroup>

        <MediaWidthHeightEditor
          width={this.props.model.width}
          height={this.props.model.height}
          editMode={this.props.editMode}
          onEditWidth={(width) => {
            const model = this.props.model.with({ width });
            this.props.onEdit(model, model);
          }}
          onEditHeight={(height) => {
            const model = this.props.model.with({ height });
            this.props.onEdit(model, model);
          }} />

        <MediaMetadataEditor
          {...this.props}
          model={this.props.model}
          onEdit={this.props.onEdit} />
      </SidebarContent>
    );
  }
  renderToolbar(): JSX.Element {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup
        label="Panopto"
        columns={6}
        highlightColor={CONTENT_COLORS.Panopto}>

        <ToolbarLayout.Column>
          <ToolbarButton onClick={onShowSidebar} size={ToolbarButtonSize.Large}>
            <div><i className="fa fa-sliders" /></div>
            <div>Details</div>
          </ToolbarButton>
        </ToolbarLayout.Column>

      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {

    const src = this.props.model.src;
    const file = src.substr(src.lastIndexOf('/') + 1);

    return (
      <div className="mediaEditor">
        <div className="mediaHeader">Panopto</div>
        <span className="mediaLabel">Source File:</span> {file}
      </div>
    );
  }
}
