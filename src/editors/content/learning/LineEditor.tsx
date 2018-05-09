import * as React from 'react';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import * as contentTypes from 'data/contentTypes';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { TitleTextEditor } from 'editors/content/learning/contiguoustext/TitleTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { Speaker, SpeakerSize } from 'editors/content/learning/Speaker';
import { Dropdown, DropdownItem } from 'editors/content/common/Dropdown';
import './LineEditor.scss';
import { ContentElements } from 'data/content/common/elements';
import MaterialEditor from 'editors/content/learning/MaterialEditor';
export interface LineEditorProps extends AbstractContentEditorProps<contentTypes.Line> {
  onShowSidebar: () => void;
  speakers: contentTypes.Speaker[];
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

  selectSpeaker(e, selectedSpeaker) {
    const { model, onEdit, speakers } = this.props;

    e.preventDefault();

    const newModel = model.with({
      speaker: speakers.find(speaker => speaker.id === selectedSpeaker.id).id,
    });

    onEdit(model, model);
  }

  onMaterialEdit(material: contentTypes.Material, sourceObject) {
    const { model, onEdit } = this.props;
    const newModel = model.with({
      material,
    });

    onEdit(newModel, sourceObject);
  }

  renderMain(): JSX.Element {
    const { model, speakers, onShowSidebar } = this.props;
    const { material, translations } = model;

    // get this line's speaker from the list of speakers passed in from dialog
    const speaker = speakers.find(speaker => speaker.id === model.speaker);

    return (
      <div className="lineEditor">
        <Speaker size={SpeakerSize.Small}  model={speaker} />
        {/* <i className="fa fa-arrow-down"/> */}
        <Dropdown label="">
          {speakers.map(speaker =>
            <DropdownItem
              onClick={e => this.selectSpeaker(e, speaker)}
              label={speaker.id}/>)}
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
