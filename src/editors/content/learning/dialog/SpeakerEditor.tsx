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
import { Maybe } from 'tsmonad';
import { Speaker, SpeakerSize } from 'editors/content/learning/dialog/Speaker';
import { TextInput } from 'editors/content/common/controls';

export interface SpeakerEditorProps extends
  AbstractContentEditorProps<contentTypes.Speaker> {
  onShowSidebar: () => void;
  services: AppServices;
  context: AppContext;
}

export interface SpeakerEditorState {
  isDisplayedAsImage: boolean;
}

export default class SpeakerEditor
  extends AbstractContentEditor<contentTypes.Speaker, SpeakerEditorProps, SpeakerEditorState> {
  constructor(props: SpeakerEditorProps) {
    super(props);

    this.state = {
      isDisplayedAsImage: this.isDisplayedAsImage(props.model),
    };

    this.onToggleDisplayAsImage = this.onToggleDisplayAsImage.bind(this);
    this.onSelectImage = this.onSelectImage.bind(this);
    this.onTitleEdit = this.onTitleEdit.bind(this);
  }

  isDisplayedAsImage(speaker: contentTypes.Speaker): boolean {
    return speaker.content.caseOf({
      just: content =>
        content instanceof contentTypes.Image
          ? true
          : false,
      nothing: () => false,
    });
  }

  componentWillReceiveProps(nextProps: SpeakerEditorProps) {
    if (nextProps.model !== this.props.model) {
      this.setState({
        isDisplayedAsImage: this.isDisplayedAsImage(nextProps.model),
      });
    }
  }

  shouldComponentUpdate(nextProps: SpeakerEditorProps, nextState: SpeakerEditorState) {
    return super.shouldComponentUpdate(nextProps, nextState)
      || this.state !== nextState;
  }

  onToggleDisplayAsImage(isDisplayedAsImage) {
    this.setState({ isDisplayedAsImage });
  }

  onSelectImage() {
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
          const updated = model.with({ content: Maybe.just(image) });
          onEdit(updated, updated);
        }
      });
  }

  onTitleEdit(title: string) {
    const { model, onEdit } = this.props;

    const newModel = model.with({
      content: title !== ''
        ? Maybe.just(title)
        : Maybe.nothing(),
    });

    onEdit(newModel, newModel);
  }

  renderSidebar(): JSX.Element {
    const { model, editMode } = this.props;
    const { content } = model;

    return (
      <SidebarContent title="Speaker">
        <SidebarGroup label="Display">
          <div className="form-check">
            <label className="form-check-label">
              <input className="form-check-input"
              name="sizingOptions"
                value="image"
                checked={this.state.isDisplayedAsImage}
                onChange={() => this.onToggleDisplayAsImage(true)}
                type="radio" />{' '}as Image
            </label>
          </div>

          <SidebarRow label="">
            <ToolbarButton
              disabled={!this.state.isDisplayedAsImage}
              onClick={this.onSelectImage}
              size={ToolbarButtonSize.Large}>
              <div>{getContentIcon(insertableContentTypes.Image)}</div>
              <div>Change Image</div>
            </ToolbarButton>
          </SidebarRow>


          <div className="form-check" style={{ marginBottom: '30px' }}>
            <label className="form-check-label">
              <input className="form-check-input"
                name="sizingOptions"
              onChange={() => this.onToggleDisplayAsImage(false)}
                value="text"
                checked={!this.state.isDisplayedAsImage}
                type="radio" />{' '}as Text
            </label>
          </div>

          <SidebarRow label="">
            <TextInput width="100%" label=""
              editMode={editMode && !this.state.isDisplayedAsImage}
              value={this.state.isDisplayedAsImage
                ? ''
                : content.caseOf({
                  just: c => c as string,
                  nothing: () => '',
                })
              }
              type="text"
              onEdit={this.onTitleEdit} />
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
