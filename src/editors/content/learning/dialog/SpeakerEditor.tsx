import * as React from 'react';
import { AbstractContentEditor, AbstractContentEditorProps }
  from 'editors/content/common/AbstractContentEditor';
import * as contentTypes from 'data/contentTypes';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS, getContentIcon, insertableContentTypes } from
  'editors/content/utils/content';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { SidebarGroup, SidebarRow } from 'components/sidebar/ContextAwareSidebar';
import { AppServices } from 'editors/common/AppServices';
import { AppContext } from 'editors/common/AppContext';
import { modalActions } from 'actions/modal';
import { selectImage } from 'editors/content/learning/ImageEditor';
import { Speaker, SpeakerSize } from 'editors/content/learning/dialog/Speaker';
import { TextInput } from 'editors/content/common/controls';
import { Maybe } from 'tsmonad';

export interface SpeakerEditorProps extends
  AbstractContentEditorProps<contentTypes.Speaker> {
  onShowSidebar: () => void;
  services: AppServices;
  context: AppContext;
}

export interface SpeakerEditorState { }

export default class SpeakerEditor
  extends AbstractContentEditor<contentTypes.Speaker, SpeakerEditorProps, SpeakerEditorState> {

  onSelectImage = () => {
    const { context, services, onEdit, model } = this.props;

    const dispatch = (services as any).dispatch;
    const dismiss = () => dispatch(modalActions.dismiss());
    const display = c => dispatch(modalActions.display(c));

    selectImage(
      model,
      context.resourcePath, context.courseModel,
      display, dismiss)
      .then((image) => {
        if (image !== null) {
          const updated = model.with({
            content: model.content.set('image', Maybe.just(image)),
          });
          onEdit(updated, updated);
        }
      });
  }

  onNameEdit = (name: string) => {
    const { model, onEdit } = this.props;

    const newModel = model.with({
      content: model.content.set('name', name),
    });

    onEdit(newModel, newModel);
  }

  renderSidebar(): JSX.Element {
    const { editMode, model } = this.props;

    return (
      <SidebarContent title="Speaker">
        Each speaker has a name with an optional image.
        <SidebarGroup label="Display">
          <SidebarRow label="">
            Name
            <TextInput width="100%" label=""
              editMode={editMode}
              value={model.content.get('name') as string}
              type="text"
              onEdit={this.onNameEdit} />
          </SidebarRow>

          <SidebarRow label="">
            <ToolbarButton
              disabled={!editMode}
              onClick={this.onSelectImage}
              size={ToolbarButtonSize.Large}>
              <div>{getContentIcon(insertableContentTypes.Image)}</div>
              <div>Add / Change Image</div>
            </ToolbarButton>
          </SidebarRow>

        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar(): JSX.Element {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Speaker" columns={4} highlightColor={CONTENT_COLORS.Dialog}>
        <ToolbarButton onClick={onShowSidebar} size={ToolbarButtonSize.Large}>
          <div><i className="fas fa-sliders-h" /></div>
          <div>Change Name or Image</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {
    const { model, context } = this.props;

    return (
      <Speaker
        context={context}
        model={model}
        size={SpeakerSize.Large} />
    );
  }
}
