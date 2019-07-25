import * as React from 'react';
import { AbstractContentEditor, AbstractContentEditorProps }
  from 'editors/content/common/AbstractContentEditor';
import * as contentTypes from 'data/contentTypes';
import './LineEditor.scss';
import { AppContext } from 'editors/common/AppContext';
import * as Immutable from 'immutable';
import { ContentElements } from 'data/content/common/elements';
import { Speaker, SpeakerSize } from 'editors/content/learning/dialog/Speaker';
import MaterialEditor from 'editors/content/learning/MaterialEditor';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { Tooltip } from 'utils/tooltip';

export interface LineEditorProps extends AbstractContentEditorProps<contentTypes.Line> {
  onShowSidebar: () => void;
  context: AppContext;
  speakers: Immutable.OrderedMap<string, contentTypes.Speaker>;
}

export interface LineEditorState {

}

export default class LineEditor
  extends AbstractContentEditor<contentTypes.Line, LineEditorProps, LineEditorState> {

  cycleSpeaker = () => {
    const { speakers, model } = this.props;
    const { speaker } = model;

    const speakersArray = speakers.toArray();
    const speakerIndex = speakersArray.findIndex(s => s.id === speaker);
    const nextIndex = speakerIndex === speakers.size - 1 ? 0 : speakerIndex + 1;
    const nextSpeaker = speakersArray[nextIndex];

    this.selectSpeaker(nextSpeaker);
  }

  selectSpeaker = (selectedSpeaker: contentTypes.Speaker) => {
    const { model, onEdit, speakers } = this.props;

    const newModel = model.with({
      speaker: speakers.find(speaker => speaker.id === selectedSpeaker.id).id,
    });

    onEdit(newModel, newModel);
  }

  onMaterialEdit = (material: contentTypes.Material, src) => {
    const { model, onEdit } = this.props;
    const newModel = model.with({
      material,
    });

    onEdit(newModel, src);
  }


  renderSidebar(): JSX.Element {
    return (
      <SidebarContent title="Line" />
    );
  }

  renderToolbar(): JSX.Element {
    return (
      <ToolbarGroup label="Line" columns={3} highlightColor={CONTENT_COLORS.Dialog}>
      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {
    const { context, model, speakers } = this.props;
    const { material } = model;

    const speaker = speakers.find(speaker => speaker.id === model.speaker);

    return (
      <div className="lineEditor">
        <Speaker
          context={context}
          model={speaker}
          size={SpeakerSize.Small} />
        <div className="line">
          <button className="btn btn-primary" onClick={this.cycleSpeaker}>
            <Tooltip delay={200} title="Change speaker">
              <i className="fas fa-sync-alt" />
            </Tooltip>
          </button>
          <MaterialEditor
            {...this.props}
            model={material}
            onEdit={this.onMaterialEdit}
            overrideRemove={(model: ContentElements, childModel) => model.size < 2} />
        </div>
      </div>
    );
  }
}
