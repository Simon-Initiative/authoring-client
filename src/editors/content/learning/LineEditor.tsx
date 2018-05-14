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
import { ContentElements } from 'data/content/common/elements';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import guid from 'utils/guid';

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
    this.onAddTranslation = this.onAddTranslation.bind(this);
    this.onTranslationEdit = this.onTranslationEdit.bind(this);
  }

  onAddTranslation() {

    const id = guid();

    const translation = new contentTypes.Translation().with({ guid: id });
    const model = this.props.model.with({
      translations: this.props.model.translations.set(translation.guid, translation),
    });

    this.props.onEdit(model, translation);
  }

  onTranslationEdit(elements, src) {

    const items = elements
      .content
      .toArray()
      .map(e => [e.guid, e]);

    const model = this.props.model.with({
      translations: Immutable.OrderedMap<string, contentTypes.Translation>(items),
    });

    this.props.onEdit(model, src);
  }

  selectSpeaker(e, selectedSpeaker) {
    e.preventDefault();

    const { model, onEdit, speakers } = this.props;

    const newModel = model.with({
      speaker: speakers.find(speaker => speaker.id === selectedSpeaker.id).id,
    });

    onEdit(newModel, newModel);
  }

  onMaterialEdit(material: contentTypes.Material, src) {
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
      <ToolbarGroup label="Line" columns={2} highlightColor={CONTENT_COLORS.Dialog}>
      </ToolbarGroup>
    );
  }

  renderMain(): JSX.Element {
    const { context, model, speakers, editMode } = this.props;
    const { material } = model;

    const speaker = speakers.find(speaker => speaker.id === model.speaker);

    const translations = new ContentElements().with({
      content: model.translations,
    });

    const getLabel = (e, i) => <span>{e.contentType + ' ' + (i + 1)}</span>;

    const labels = {};
    model.translations.toArray().map((e, i) => labels[e.guid] = getLabel(e, i));

    const bindLabel = el => [{ propertyName: 'label', value: labels[el.guid] }];

    const translationEditors = model.translations.size > 0
      ? <ContentContainer
        {...this.props}
        model={translations}
        bindProperties={bindLabel}
        onEdit={this.onTranslationEdit}
      />
      : null;

    return (
      <div className="lineEditor">
        <Speaker
          context={context}
          model={speaker}
          size={SpeakerSize.Small} />
        <Dropdown label="">
          {speakers.toArray().map(speaker =>
            <DropdownItem
              key={speaker.id}
              onClick={e => this.selectSpeaker(e, speaker)}
              label={speaker.title.caseOf({
                just: title => title,
                nothing: () => 'Unnamed speaker',
              })} />)}
        </Dropdown>
        <div className="lineText">
          <MaterialEditor
            {...this.props}
            model={material}
            onEdit={this.onMaterialEdit}
            overrideRemove={(model: ContentElements, childModel) => model.size < 2} />
          {translationEditors}
          <button type="button"
            disabled={!editMode}
            onClick={this.onAddTranslation}
            className="btn btn-link">+ Add translation</button>
        </div>
      </div>
    );
  }
}
