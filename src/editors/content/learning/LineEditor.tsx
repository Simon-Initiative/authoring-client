import * as React from 'react';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import * as contentTypes from 'data/contentTypes';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { Speaker, SpeakerSize } from 'editors/content/learning/Speaker';
import { Dropdown, DropdownItem } from 'editors/content/common/Dropdown';
import './LineEditor.scss';
import MaterialEditor from 'editors/content/learning/MaterialEditor';
import { AppContext } from 'editors/common/AppContext';
import * as Immutable from 'immutable';

export interface LineEditorProps extends AbstractContentEditorProps<contentTypes.Line> {
  onShowSidebar: () => void;
  context: AppContext;
  speakers: Immutable.OrderedMap<string, contentTypes.Speaker>;
}

export interface LineEditorState {

}

export default class LineEditor
  extends AbstractContentEditor<contentTypes.Line, LineEditorProps, LineEditorState> {
  constructor(props) {
    super(props);

    this.selectSpeaker = this.selectSpeaker.bind(this);
    this.onMaterialEdit = this.onMaterialEdit.bind(this);
  }

  selectSpeaker(e, selectedSpeaker) {
    e.preventDefault();

    const { model, onEdit, speakers } = this.props;

    const newModel = model.with({
      speaker: speakers.find(speaker => speaker.id === selectedSpeaker.id).id,
    });

    onEdit(newModel, newModel);
  }

  onMaterialEdit(material: contentTypes.Material, sourceObject) {
    const { model, onEdit } = this.props;
    const newModel = model.with({
      material,
    });

    onEdit(newModel, sourceObject);
  }


  renderSidebar(): JSX.Element {
    return (
      <SidebarContent title="Line" />
    );
  }

  renderToolbar(): JSX.Element {
    return (
      <ToolbarGroup label="Line" columns={2} highlightColor={CONTENT_COLORS.Dialog}>
      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {
    const { context, model, speakers, onShowSidebar } = this.props;
    const { material, translations } = model;

    const speaker = speakers.find(speaker => speaker.id === model.speaker);

    return (
      <div className="lineEditor">
        <Speaker
          context={context}
          model={speaker}
          size={SpeakerSize.Small}   />
        <Dropdown label="">
          {speakers.toArray().map(speaker =>
            <DropdownItem
              key={speaker.id}
              onClick={e => this.selectSpeaker(e, speaker)}
              label={speaker.title.caseOf({
                just: title => title,
                nothing: () => 'Unnamed speaker',
              })}/>)}
        </Dropdown>
        <div className="lineText">
          <MaterialEditor
            {...this.props}
            model={material}
            onEdit={this.onMaterialEdit} />
        </div>
      </div>
    );
  }
}