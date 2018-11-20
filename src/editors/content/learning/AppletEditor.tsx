import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { ParamContent } from 'data/content/learning/param';

import { Applet as AppletType } from 'data/content/learning/applet';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { PurposeTypes } from 'data/content/learning/common';
import { Select } from 'editors/content/common/controls';
import { Maybe } from 'tsmonad';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToggleSwitch } from 'components/common/ToggleSwitch';
import { TextInput } from 'editors/content/common/TextInput';
import { ContentElements } from 'data/content/common/elements';

import { MediaMetadataEditor, MediaWidthHeightEditor } from 'editors/content/learning/MediaItems';
import {
  DiscoverableId,
} from 'components/common/Discoverable.controller';

import './Media.scss';
import { ContentContainer } from 'editors/content/container/ContentContainer';

export interface AppletProps extends AbstractContentEditorProps<AppletType> {
  onShowSidebar: () => void;
  onDiscover: (id: DiscoverableId) => void;
}

export interface AppletState {

}

export default class AppletEditor
  extends AbstractContentEditor<AppletType, AppletProps, AppletState> {

  constructor(props) {
    super(props);
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

  onArchiveEdit(archive) {
    const model = this.props.model.with({ archive });
    this.props.onEdit(model, model);
  }
  onCodebaseEdit(codebase) {
    const model = this.props.model.with({ codebase });
    this.props.onEdit(model, model);
  }
  onCodeEdit(code) {
    const model = this.props.model.with({ code });
    this.props.onEdit(model, model);
  }

  renderSidebar(): JSX.Element {

    const { model } = this.props;

    return (
      <SidebarContent title="Applet">

        <SidebarGroup label="Archive">
          <TextInput width="100%" label=""
            editMode={this.props.editMode}
            value={model.archive}
            type="text"
            onEdit={this.onArchiveEdit.bind(this)} />
        </SidebarGroup>

        <SidebarGroup label="Codebase">
          <TextInput width="100%" label=""
            editMode={this.props.editMode}
            value={model.codebase}
            type="text"
            onEdit={this.onCodebaseEdit.bind(this)} />
        </SidebarGroup>

        <SidebarGroup label="Code">
          <TextInput width="100%" label=""
            editMode={this.props.editMode}
            value={model.code}
            type="text"
            onEdit={this.onCodeEdit.bind(this)} />
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
        label="Applet"
        columns={6}
        highlightColor={CONTENT_COLORS.Applet}>

        <ToolbarLayout.Column>
          <ToolbarButton onClick={onShowSidebar} size={ToolbarButtonSize.Large}>
            <div><i className="fa fa-sliders" /></div>
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

    return (
      <div className="mediaEditor">

        <div className="mediaHeader">Applet</div>
        <div className="captionEditor">
          <div className="captionHeader">Caption</div>
          <ContentContainer
            {...this.props}
            onEdit={this.onCaptionEdit}
            model={this.props.model.caption.content} />
        </div>
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
