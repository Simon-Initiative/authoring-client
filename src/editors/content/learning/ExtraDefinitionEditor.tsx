import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { ContentElements } from 'data/content/common/elements';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { getEditorByContentType } from 'editors/content/container/registry';

import { Maybe } from 'tsmonad';
import {
  DiscoverableId,
} from 'components/common/Discoverable.controller';

import { styles } from './Definition.styles';

export interface ExtraDefinitionEditorProps
  extends AbstractContentEditorProps<contentTypes.Extra> {
  onShowSidebar: () => void;
  onDiscover: (id: DiscoverableId) => void;
}

export interface ExtraDefinitionEditorState {

}

/**
 * The content editor for definitions.
 */
@injectSheet(styles)
export default class ExtraDefinitionEditor
    extends AbstractContentEditor<contentTypes.Extra,
    StyledComponentProps<ExtraDefinitionEditorProps>, ExtraDefinitionEditorState> {
  selectionState: any;

  constructor(props) {
    super(props);
  }


  renderSidebar() {

    return (
      <SidebarContent title="Rollover">
      </SidebarContent>
    );
  }

  renderToolbar() {

    return (
      <ToolbarGroup label="Rollover"
        columns={2} highlightColor={CONTENT_COLORS.Definition}>

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

  onPronunciationEdit(pronunciation, src) {

    if (pronunciation.content.size === 0) {
      const model = this.props.model.with({
        pronunciation: Maybe.nothing(),
      });

      this.props.onEdit(model, src);
    } else {
      const model = this.props.model.with({
        pronunciation: Maybe.just(pronunciation),
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

  onTranslationEdit(translation, src) {

    if (translation.content.size === 0) {
      const model = this.props.model.with({
        translation: Maybe.nothing(),
      });

      this.props.onEdit(model, src);
    } else {
      const model = this.props.model.with({
        translation: Maybe.just(translation),
      });

      this.props.onEdit(model, src);
    }

  }


  handleOnFocus(e) {
    // We override the parent implementation, as the
    // default focus behavior of setting the parent container
    // causes problems since this component has no immediate
    // parent
    e.stopPropagation();
  }

  handleOnClick(e) {
    // Override
    e.stopPropagation();
  }

  onContentEdit(content, src) {
    const model = this.props.model.with({ content });
    this.props.onEdit(model, src);
  }

  renderMain() : JSX.Element {
    const { model } = this.props;

    if (model.isDefinition()) {
      return this.renderAsDefinition();
    }
    return this.renderAsContent();
  }

  renderAsContent() : JSX.Element {

    const { className, classes } = this.props;

    return (
      <div className={classNames([classes.definition, className])}>
        <ContentContainer
          {...this.props}
          model={this.props.model.content}
          onEdit={this.onContentEdit.bind(this)}
        />
      </div>
    );
  }

  renderAsDefinition() : JSX.Element {

    const { className, classes, model, editMode } = this.props;

    const getLabel = (e, i) => <span>{e.contentType + ' ' + (i + 1)}</span>;

    const translation = model.translation.caseOf({
      just: p => p,
      nothing: () => new contentTypes.Translation(),
    });

    const pronunciation = model.pronunciation.caseOf({
      just: p => p,
      nothing: () => new contentTypes.Pronunciation(),
    });

    const meanings = new ContentElements().with({
      content: model.meaning,
    });

    const labels = {};
    model.meaning.toArray().map((e, i) => labels[e.guid] = getLabel(e, i));

    const bindLabel = el => [{ propertyName: 'label', value: labels[el.guid] }];


    const translationProps = Object.assign({}, this.props, {
      model: translation,
      label: 'Translation',
      onEdit: this.onTranslationEdit.bind(this),
    });

    const translationEditor = React.createElement(
      getEditorByContentType('Translation'), translationProps);

    const pronunciationProps = Object.assign({}, this.props, {
      model: pronunciation,
      onEdit: this.onPronunciationEdit.bind(this),
    });

    const pronunciationEditor = React.createElement(
      getEditorByContentType('Pronunciation'), pronunciationProps);

    return (
      <div className={classNames([classes.definition, className])}>

        <button type="button"
          disabled={!editMode}
          onClick={this.onAddMeaning.bind(this)}
          className="btn btn-link">+ Add meaning</button>

        <ContentContainer
          {...this.props}
          model={meanings}
          bindProperties={bindLabel}
          onEdit={this.onMeaningEdit.bind(this)}
        />

        {translationEditor}

        {pronunciationEditor}

      </div>
    );
  }
}
