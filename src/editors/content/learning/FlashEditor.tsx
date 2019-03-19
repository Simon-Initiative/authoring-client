import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { ParamContent } from 'data/content/learning/param';
import { Flash as FlashType } from 'data/content/learning/flash';
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
import { PurposeTypes } from 'data/content/learning/common';
import { Select } from 'editors/content/common/controls';
import { Maybe } from 'tsmonad';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { ContentElements } from 'data/content/common/elements';
import { ContentContainer } from 'editors/content/container/ContentContainer';

import { MediaMetadataEditor, MediaWidthHeightEditor } from 'editors/content/learning/MediaItems';
import {
  DiscoverableId,
} from 'components/common/Discoverable.controller';

import './Media.scss';
import { CaptionTextEditor } from './contiguoustext/CaptionTextEditor';

export interface FlashProps extends AbstractContentEditorProps<FlashType> {
  onShowSidebar: () => void;
  onDiscover: (id: DiscoverableId) => void;
}

export interface FlashState {

}

export default class FlashEditor
  extends AbstractContentEditor<FlashType, FlashProps, FlashState> {

  constructor(props) {
    super(props);

    this.onSelect = this.onSelect.bind(this);
    this.onPurposeChange = this.onPurposeChange.bind(this);
    this.onLoggingToggle = this.onLoggingToggle.bind(this);
    this.onCaptionEdit = this.onCaptionEdit.bind(this);
  }

  onCaptionEdit(content: ContentElements, src) {
    const caption = this.props.model.caption.with({ content });
    this.props.onEdit(this.props.model.with({ caption }), src);
  }

  onLoggingToggle() {
    const model = this.props.model.with({ logging: !this.props.model.logging });
    this.props.onEdit(model, model);
  }

  onPurposeChange(purpose) {
    const model = this.props.model.with({
      purpose: purpose === ''
        ? Maybe.nothing()
        : Maybe.just(purpose),
    });
    this.props.onEdit(model, model);
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

    const { model } = this.props;

    return (
      <SidebarContent title="Flash">

        <SidebarGroup label="Source File">
          <div>{file}</div>
          <ToolbarButton onClick={this.onSelect} size={ToolbarButtonSize.Large}>
            <div><i className="far fa-file" /></div>
            <div>Select File</div>
          </ToolbarButton>
        </SidebarGroup>

        <SidebarGroup label="Logging">
          <ToggleSwitch
            checked={model.logging}
            onClick={this.onLoggingToggle}
            label="Enabled" />
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
        label="Flash"
        columns={6}
        highlightColor={CONTENT_COLORS.Flash}>

        <ToolbarLayout.Column>
          <ToolbarButton onClick={onShowSidebar} size={ToolbarButtonSize.Large}>
            <div><i className="fas fa-sliders-h" /></div>
            <div>Details</div>
          </ToolbarButton>
        </ToolbarLayout.Column>

        <ToolbarLayout.Column>
          <div style={{ marginLeft: 8 }}>Purpose</div>
          <Select
            editMode={this.props.editMode}
            label=""
            value={this.props.model.purpose.caseOf({
              nothing: () => '',
              just: p => p,
            })}
            onChange={this.onPurposeChange}>
            <option value={''}>
              {''}
            </option>
            {PurposeTypes.map(p =>
              <option
                key={p.value}
                value={p.value}>
                {p.label}
              </option>)}
          </Select>
        </ToolbarLayout.Column>

      </ToolbarGroup>
    );
  }

  onAddParam() {
    const c = new contentTypes.ParamText().with({
      text: 'Value',
    });
    const param = new contentTypes.Param().with({
      name: 'Name ' + (this.props.model.params.size + 1),
      content: Immutable.OrderedMap<string, ParamContent>()
        .set(c.guid, c),
    });

    const params = this.props.model.params.set(param.guid, param);

    const model = this.props.model.with({ params });

    this.props.onEdit(model, model);
  }

  onParametersEdit(elements, src) {

    const items = elements
      .content
      .toArray()
      .map(e => [e.guid, e]);

    const model = this.props.model.with({
      params: Immutable.OrderedMap<string, contentTypes.Param>(items),
    });

    this.props.onEdit(model, src);
  }

  renderParameters() {

    if (this.props.model.params.size === 0) {
      return null;
    }

    const elements = new ContentElements().with({
      content: this.props.model.params,
    });

    return (
      <ContentContainer
        {...this.props}
        model={elements}
        onEdit={this.onParametersEdit.bind(this)}
      />
    );
  }

  renderMain(): JSX.Element {
    const {
      editMode, activeContentGuid, context, parent, services, onFocus, hover,
      onUpdateHover, model,
    } = this.props;
    const src = this.props.model.src;
    const file = src.substr(src.lastIndexOf('/') + 1);

    return (
      <div className="mediaEditor">

        <div className="mediaHeader">Flash</div>

        <div>
          <span className="mediaLabel">Source File:</span> {file}
        </div>

        <CaptionTextEditor
          editMode={editMode}
          activeContentGuid={activeContentGuid}
          context={context}
          parent={parent}
          services={services}
          onFocus={onFocus}
          hover={hover}
          onUpdateHover={onUpdateHover}
          onEdit={this.onCaptionEdit}
          model={model.caption.content} />

        <span className="mediaLabel">Parameters:</span>
        {this.renderParameters()}
        <button type="button"
          disabled={!this.props.editMode}
          onClick={this.onAddParam.bind(this)}
          className="btn btn-link">+ Add parameter</button>

      </div>
    );
  }
}
