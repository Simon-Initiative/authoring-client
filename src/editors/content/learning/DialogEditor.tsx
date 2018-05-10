import * as React from 'react';
import * as Immutable from 'immutable';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import * as contentTypes from 'data/contentTypes';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { TitleTextEditor } from 'editors/content/learning/contiguoustext/TitleTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import SpeakerEditor from 'editors/content/learning/SpeakerEditor';
import LineEditor from 'editors/content/learning/LineEditor';
import './DialogEditor.scss';
import { Maybe } from 'tsmonad';
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

  onLineEdit(line: contentTypes.Line, sourceObject) {
    const { model, onEdit } = this.props;

    onEdit(model.with({ lines: model.lines.set(line.guid, line) }), sourceObject);
  }

  onAddSpeaker(e) {
    e.preventDefault();

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

    const { model, onEdit } = this.props;
    const { lines, speakers } = model;

    const id = guid();

    const line = new contentTypes.Line().with({
      guid: id,
      id: Maybe.just(id),
      // If there are multiple lines, swap the default speaker
      // when adding new lines
      speaker: lines.size > 1
        ? lines.toArray()[lines.size - 2].speaker
        : speakers.last().id,
      material: contentTypes.Material.fromText('Empty text block', ''),
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
      <ToolbarGroup label="Dialog" columns={2} highlightColor={CONTENT_COLORS.Dialog}>
      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {
    const { model } = this.props;
    const { media, lines } = model;

    const speakers = new ContentElements().with({
      content: model.speakers,
    });

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

        <div className="speakerContainer">
          <ContentContainer
            {...this.props}
            model={speakers}
            onEdit={this.onSpeakerEdit}
            layout={Layout.Horizontal}
          />
          <div className="addButton addSpeaker">
            {model.speakers.toArray().length === 0
              ? 'Add speaker'
              : null}
            <a onClick={this.onAddSpeaker}>
              <i className="fa fa-plus"></i>
            </a>
          </div>
        </div>

        {lines.toArray().map(line =>
          <LineEditor
            {...this.props}
            model={line}
            onEdit={this.onLineEdit}
            speakers={model.speakers} />)}
        {model.speakers.toArray().length > 0
          ? <div className="addButton addLine">
          {lines.toArray().length === 0
            ? 'Add line'
            : null}
          <a onClick={this.onAddLine}>
            <i className="fa fa-plus"></i>
          </a>
        </div>
          : null}
      </div>
    );
  }
}
