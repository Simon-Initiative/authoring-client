import * as React from 'react';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import * as contentTypes from 'data/contentTypes';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { TitleTextEditor } from 'editors/content/learning/contiguoustext/TitleTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import SpeakerEditor from 'editors/content/learning/SpeakerEditor';
import LineEditor from 'editors/content/learning/LineEditor';
import './DialogEditor.scss';
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

  onAddSpeaker(e) {
    const { model, onEdit } = this.props;

    e.preventDefault();

    const speaker = new contentTypes.Speaker();
    model.speakers.set(speaker.guid, speaker);
    onEdit(model, model);
  }

  onAddLine(e) {
    const { model, onEdit } = this.props;

    e.preventDefault();

    const line = new contentTypes.Line();
    model.lines.set(line.guid, line);
    onEdit(model, model);
  }

  renderMain(): JSX.Element {
    const { model } = this.props;
    const { media, speakers, lines } = model;

    // Dialogs include a default speaker and line for DTD validation on creation
    const actualSpeakers = speakers.toArray().slice(1);
    const actualLines = lines.toArray().slice(1);

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
          {actualSpeakers.map(speaker =>
            <SpeakerEditor
              {...this.props}
              model={speaker}
              onEdit={(speaker, src) => { }} />)}
          <div className="addButton addSpeaker">
            {actualSpeakers.length === 0
              ? 'Add speaker'
              : null}
            <a onClick={this.onAddSpeaker}>
              <i className="fa fa-plus"></i>
            </a>
          </div>
        </div>

        {actualLines.map(line =>
          <LineEditor
            {...this.props}
            model={line}
            onEdit={(line, src) => { }}
            speakers={actualSpeakers} />)}
        {actualSpeakers.length > 0
          ? <div className="addButton addLine">
          {actualLines.length === 0
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
