import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { ContentElement } from 'data/content/common/interfaces';
import { ContentElements } from 'data/content/common/elements';
import { ToolbarContentContainer } from 'editors/content/container/ToolbarContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { TextInput } from '../common/controls';
import { Maybe } from 'tsmonad';
import {
  Discoverable, FocusAction, DiscoverableId,
} from 'components/common/Discoverable.controller';

import { styles } from './Definition.styles';

export interface DefinitionEditorProps
  extends AbstractContentEditorProps<contentTypes.Definition> {
  onShowSidebar: () => void;
  onDiscover: (id: DiscoverableId) => void;
}

export interface DefinitionEditorState {

}

/**
 * The content editor for definitions.
 */
@injectSheet(styles)
export default class DefinitionEditor
  extends AbstractContentEditor<contentTypes.Definition,
  StyledComponentProps<DefinitionEditorProps>, DefinitionEditorState> {
  selectionState: any;

  constructor(props) {
    super(props);
  }

  onTitleEdit(text) {

    const title = this.props.model.title.caseOf({
      just: t => Maybe.just(t.with({ text })),
      nothing: () => Maybe.just(new contentTypes.Title().with({ text })),
    });
    this.props.onEdit(this.props.model.with({ title }));
  }

  renderSidebar() {
    const { model } = this.props;

    const title = model.title.caseOf({
      just: t => t,
      nothing: () => contentTypes.Title.fromText(''),
    });


    return (
      <SidebarContent title="Definition">
        <SidebarGroup label="Title">
          <Discoverable
            id={DiscoverableId.DefinitionEditorTitle}
            focusChild=".DraftEditor-editorContainer"
            focusAction={FocusAction.Click}>
            <ToolbarContentContainer
              onFocus={() => { }}
              context={this.props.context}
              services={this.props.services}
              editMode={this.props.editMode}
              activeContentGuid={null}
              hover={null}
              onUpdateHover={() => { }}
              model={title.text}
              onEdit={this.onTitleEdit.bind(this)} />
          </Discoverable>
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderToolbar() {
    const { onShowSidebar, onDiscover } = this.props;

    return (
      <ToolbarGroup label="Definition" columns={3} highlightColor={CONTENT_COLORS.Definition}>
        <ToolbarButton
          onClick={() => {
            onShowSidebar();
            onDiscover(DiscoverableId.DefinitionEditorTitle);
          }} size={ToolbarButtonSize.Large}>
          <div><i style={{ textDecoration: 'underline' }}>Abc</i></div>
          <div>Title</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }

  onAddMeaning() {

    const material = contentTypes.Material.fromText('', '');
    const meaning = new contentTypes.Meaning({ material });
    const model = this.props.model.with({
      meaning: this.props.model.meaning.set(meaning.guid, meaning),
    });

    this.props.onEdit(model, meaning);
  }

  onAddTranslation() {

    const translation = new contentTypes.Translation();
    const model = this.props.model.with({
      translation: this.props.model.translation.set(translation.guid, translation),
    });

    this.props.onEdit(model, translation);
  }

  onAddPronunciation() {

    const pronunciation = new contentTypes.Pronunciation();
    const model = this.props.model.with({
      pronunciation: Maybe.just(pronunciation),
    });

    this.props.onEdit(model, pronunciation);
  }

  onPronunciationEdit(pronunciations, src) {

    if (pronunciations.content.size === 0) {
      const model = this.props.model.with({
        pronunciation: Maybe.nothing(),
      });

      this.props.onEdit(model, src);
    } else {
      const model = this.props.model.with({
        pronunciation: Maybe.just(pronunciations.content.first()),
      });

      this.props.onEdit(model, src);
    }
  }

  onMeaningEdit(elements, src) {

    if (elements.content.size > 0) {
      const items = elements
        .content
        .toArray()
        .map(e => [e.guid, e]);

      const model = this.props.model.with({
        meaning: Immutable.OrderedMap<string, contentTypes.Meaning>(items),
      });

      this.props.onEdit(model, src);
    }
  }

  onTranslationEdit(elements, src) {

    const items = elements
      .content
      .toArray()
      .map(e => [e.guid, e]);

    const model = this.props.model.with({
      translation: Immutable.OrderedMap
        <string, contentTypes.Translation>(items),
    });

    this.props.onEdit(model, src);
  }

  onTermEdit(term) {
    const { model } = this.props;
    this.props.onEdit(model.with({ term }), model);
  }

  renderMain(): JSX.Element {

    const { className, classes, model, editMode } = this.props;

    const canAddPronunciation = model.pronunciation.caseOf({
      just: n => false,
      nothing: () => true,
    });

    const getLabel = (e, i) => <span>{e.contentType + ' ' + (i + 1)}</span>;

    const translations = new ContentElements().with({
      content: model.translation,
    });
    const meanings = new ContentElements().with({
      content: model.meaning,
    });
    const pronunciations = new ContentElements().with({
      content: model.pronunciation.caseOf({
        just: p => Immutable.OrderedMap<string, ContentElement>().set(p.guid, p),
        nothing: () => Immutable.OrderedMap<string, ContentElement>(),
      }),
    });

    const labels = {};
    model.translation.toArray().map((e, i) => labels[e.guid] = getLabel(e, i));
    model.meaning.toArray().map((e, i) => labels[e.guid] = getLabel(e, i));

    const bindLabel = el => [{ propertyName: 'label', value: labels[el.guid] }];

    const translationEditors = model.translation.size > 0
      ? <ContentContainer
        {...this.props}
        model={translations}
        bindProperties={bindLabel}
        onEdit={this.onTranslationEdit.bind(this)}
      />
      : null;

    const pronunciationEditor = model.pronunciation.caseOf({
      just: p => <ContentContainer
        {...this.props}
        model={pronunciations}
        onEdit={this.onPronunciationEdit.bind(this)}
      />,
      nothing: () => null,
    });

    return (
      <div className={classNames([classes.definition, className])}>
        Term<TextInput
          {...this.props}
          width="150px"
          value={model.term}
          onEdit={this.onTermEdit.bind(this)}
          label="Definition Term"
          type="text"
        />
        <ContentContainer
          {...this.props}
          model={meanings}
          bindProperties={bindLabel}
          onEdit={this.onMeaningEdit.bind(this)}
        />
        {translationEditors}
        {pronunciationEditor}
        <button type="button"
          disabled={!editMode}
          onClick={this.onAddMeaning.bind(this)}
          className="btn btn-link">+ Add meaning</button>
        <button type="button"
          disabled={!editMode}
          onClick={this.onAddTranslation.bind(this)}
          className="btn btn-link">+ Add translation</button>
        <button type="button"
          disabled={!editMode || !canAddPronunciation}
          onClick={this.onAddPronunciation.bind(this)}
          className="btn btn-link">+ Add pronunciation</button>
      </div>
    );
  }
}
