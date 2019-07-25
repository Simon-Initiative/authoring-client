import * as React from 'react';
import * as Immutable from 'immutable';
import { AbstractContentEditor, AbstractContentEditorProps }
  from 'editors/content/common/AbstractContentEditor';
import * as contentTypes from 'data/contentTypes';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { TitleTextEditor } from 'editors/content/learning/contiguoustext/TitleTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import './DialogEditor.scss';
import guid from 'utils/guid';
import { ContentContainer, Layout } from 'editors/content/container/ContentContainer';
import { ContentElements } from 'data/content/common/elements';

export interface DialogEditorProps extends AbstractContentEditorProps<contentTypes.Dialog> {
  onShowSidebar: () => void;
}

export interface DialogEditorState {

}

export default class DialogEditor
  extends AbstractContentEditor<contentTypes.Dialog, DialogEditorProps, DialogEditorState> {
  constructor(props) {
    super(props);

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onAddSpeaker = this.onAddSpeaker.bind(this);
    this.onAddLine = this.onAddLine.bind(this);
    this.onLineEdit = this.onLineEdit.bind(this);
    this.onSpeakerEdit = this.onSpeakerEdit.bind(this);
    this.overrideSpeakerRemove = this.overrideSpeakerRemove.bind(this);
  }

  onTitleEdit(ct: ContiguousText, sourceObject) {
    const oldTitle = this.props.model.title;
    const title = oldTitle.with({
      text: oldTitle.text.with({
        content: oldTitle.text.content.set(ct.guid, ct),
      }),
    });

    const model = this.props.model.with({ title });

    this.props.onEdit(model, sourceObject);
  }

  onSpeakerEdit(elements: ContentElements, sourceObject) {

    const items = elements
      .content
      .toArray()
      .map(e => [e.guid, e]);

    const model = this.props.model.with({
      speakers: Immutable.OrderedMap<string, contentTypes.Speaker>(items),
    });

    this.props.onEdit(model, sourceObject);
  }

  onLineEdit(elements: ContentElements, sourceObject) {

    const items = elements
      .content
      .toArray()
      .map(e => [e.guid, e]);

    const model = this.props.model.with({
      lines: Immutable.OrderedMap<string, contentTypes.Line>(items),
    });

    this.props.onEdit(model, sourceObject);
  }

  onAddSpeaker(e) {
    e.preventDefault();
    e.stopPropagation();

    const { model, onEdit } = this.props;

    const id = guid();

    const speaker = new contentTypes.Speaker().with({
      guid: id,
      id,
    });
    const speakers = model.speakers.set(speaker.guid, speaker);
    const newModel = model.with({ speakers });
    onEdit(newModel, speaker);
  }

  onAddLine(e) {
    e.preventDefault();
    e.stopPropagation();

    const { model, onEdit } = this.props;
    const { lines, speakers } = model;

    const id = guid();

    const line = new contentTypes.Line().with({
      guid: id,
      id,
      // If there are multiple lines, swap the default speaker
      // when adding new lines
      speaker: lines.size > 1
        ? lines.toArray()[lines.size - 2].speaker
        : speakers.last().id,
      material: contentTypes.Material.fromText('So then I said....', ''),
    });

    onEdit(model.with({ lines: lines.set(line.guid, line) }), line);
  }

  renderSidebar(): JSX.Element {
    return (
      <SidebarContent title="Dialog" />
    );
  }

  renderToolbar(): JSX.Element {
    return (
      <ToolbarGroup label="Dialog" columns={3} highlightColor={CONTENT_COLORS.Dialog}>
      </ToolbarGroup>
    );
  }

  overrideSpeakerRemove(model: ContentElements, speaker: contentTypes.Speaker): boolean {
    // Prevent removal of last speaker
    if (model.size < 2) {
      return true;
    }

    // Prevent removal if speaker is used in any lines
    return this.props.model.lines.reduce(
      (speakerUsed: boolean, line) => line.speaker === speaker.id ? true : speakerUsed,
      false);
  }

  renderMain(): JSX.Element {
    const { model } = this.props;

    const speakers = new ContentElements().with({
      content: model.speakers,
      supportedElements: Immutable.List(['speaker']),
    });

    const lines = new ContentElements().with({
      content: model.lines,
      supportedElements: Immutable.List(['line']),
    });

    const bindSpeakers = el => [{ propertyName: 'speakers', value: model.speakers }];

    return (
      <div>
        <TitleTextEditor
          context={this.props.context}
          services={this.props.services}
          onFocus={this.props.onFocus}
          model={this.props.model.title.text.content.first() as ContiguousText}
          editMode={this.props.editMode}
          onEdit={this.onTitleEdit}
          editorStyles={{ fontSize: 20 }} />

        <div style={{ marginLeft: 20 }}>Speakers</div>
        <div className="speakerContainer">
          <ContentContainer
            {...this.props}
            model={speakers}
            onEdit={this.onSpeakerEdit}
            layout={Layout.Horizontal}
            overrideRemove={this.overrideSpeakerRemove}
          />
          <div className="addButton addSpeaker">
            <button className="btn btn-primary" onClick={this.onAddSpeaker}>
              Add Speaker
            </button>
          </div>
        </div>

        <div style={{ marginLeft: 20 }}>
          Lines
          <div style={{ fontStyle: 'italic' }}>
            Add line translations by highlighting a word and adding a "Rollover Definition"
            from the toolbar.
          </div>
        </div>

        <div className="lineContainer">
          <ContentContainer
            {...this.props}
            model={lines}
            onEdit={this.onLineEdit}
            bindProperties={bindSpeakers}
            overrideRemove={(model: ContentElements, childModel) => model.size < 2}
          />
        </div>
        {model.speakers.size > 0
          ? <div className="addButton addLine">
            <button className="btn btn-primary" onClick={this.onAddLine}>
              Add Line
            </button>
          </div>
          : null}
      </div>
    );
  }
}
