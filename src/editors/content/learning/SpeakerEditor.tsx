import * as React from 'react';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import * as contentTypes from 'data/contentTypes';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { TitleTextEditor } from 'editors/content/learning/contiguoustext/TitleTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import { CONTENT_COLORS } from 'editors/content/utils/content';

// import './SpeakerEditor.scss';
import { ContentElements } from 'data/content/common/elements';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { SidebarGroup, SidebarRow } from 'components/sidebar/ContextAwareSidebar';
import { TextInput } from 'editors/content/common/controls';
import { AppServices } from 'editors/common/AppServices';
import { AppContext } from 'editors/common/AppContext';
import { modalActions } from 'actions/modal';
import { selectImage } from 'editors/content/learning/ImageEditor';
import { Maybe } from 'tsmonad';
import { Speaker, SpeakerSize } from 'editors/content/learning/Speaker';

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
  constructor(props) {
    super(props);

    this.state = {
      isDisplayedAsImage: false,
    };

    this.onToggleDisplayAsImage = this.onToggleDisplayAsImage.bind(this);
    this.onSelectImage = this.onSelectImage.bind(this);
  }

  onToggleDisplayAsImage(isDisplayedAsImage) {
    this.setState({ isDisplayedAsImage });

    if (isDisplayedAsImage) {
      // gray out text
    } else {
      // gray out image
    }
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


  renderSidebar(): JSX.Element {
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
                type="radio" />&nbsp;
            as Image
            </label>
          </div>

          <SidebarRow label="">
            <ToolbarButton
              disabled={!this.state.isDisplayedAsImage}
              onClick={this.onSelectImage}
              size={ToolbarButtonSize.Large}>
              <div><i className="fa fa-image" /></div>
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
                type="radio" />&nbsp;
            as Text
            </label>
          </div>
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar(): JSX.Element {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Speaker" columns={3} highlightColor={CONTENT_COLORS.Dialog}>
        <ToolbarButton onClick={onShowSidebar} size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-sliders" /></div>
          <div>Change Name or Image</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {
    const { model } = this.props;
    return (
      <Speaker size={SpeakerSize.Large} model={model}/>
    );
  }
}
