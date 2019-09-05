import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { withStyles, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { ContentElements, TEXT_ELEMENTS } from 'data/content/common/elements';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { getEditorByContentType } from 'editors/content/container/registry';
import { TextSelection } from 'types/active';
import { Editor } from 'slate';
import { Maybe } from 'tsmonad';
import {
  DiscoverableId,
} from 'components/common/Discoverable.controller';

import { styles } from 'editors/content/learning/Definition.styles';

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
class ExtraDefinitionEditor
  extends AbstractContentEditor<contentTypes.Extra,
  StyledComponentProps<ExtraDefinitionEditorProps, typeof styles>, ExtraDefinitionEditorState> {

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
        columns={3} highlightColor={CONTENT_COLORS.Definition}>

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

    const model = this.props.model.with({
      pronunciation,
    });

    this.props.onEdit(model, src);

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
    } else if (elements.content.size === 0) {

      const model = this.props.model.with({
        meaning: Immutable.OrderedMap<string, contentTypes.Meaning>(),
      });

      this.props.onEdit(model, model);
    }

  }

  onTranslationEdit(translation, src) {

    const model = this.props.model.with({
      translation,
    });

    this.props.onEdit(model, src);

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

  renderMain(): JSX.Element {
    const { model } = this.props;

    if (model.isDefinition()) {
      return this.renderAsDefinition();
    }
    return this.renderAsContent();
  }

  renderAsContent(): JSX.Element {

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

  renderAsDefinition(): JSX.Element {

    const { className, classes, model, editMode } = this.props;

    const getLabel = (e, i) => <span>{e.contentType + ' ' + (i + 1)}</span>;

    const { translation, pronunciation } = model;

    const meanings = new ContentElements().with({
      content: model.meaning,
    });

    const labels = {};
    model.meaning.toArray().map((e, i) => labels[e.guid] = getLabel(e, i));

    const bindLabel = el => [{ propertyName: 'label', value: labels[el.guid] }];

    const translationParent = {
      supportedElements: Immutable.List<string>(TEXT_ELEMENTS),
      onEdit(content: Object, source: Object) {
        this.props.onEdit(this.props.model.with({ translation: content }), source);
      },
      onAddNew(content: Object, editor: Maybe<Editor>) { },
      onRemove(content: Object) { },
      onDuplicate(content: Object) { },
      onMoveUp(content: Object) { },
      onMoveDown(content: Object) { },
      onPaste() { },
      props: this.props,
    };

    const translationProps = Object.assign({}, this.props, {
      model: translation,
      label: 'Translation',
      onEdit: this.onTranslationEdit.bind(this),
      parent: this,
      onClick: () => { },
      onFocus: (m, p, t) => this.props.onFocus(m, translationParent, t),
    });

    const pronunciationParent = {
      supportedElements: Immutable.List<string>(TEXT_ELEMENTS),
      onEdit(content: Object, source: Object) {
        this.props.onEdit(this.props.model.with({ pronunciation: content }), source);
      },
      onAddNew(content: Object, editor: Maybe<Editor>) { },
      onRemove(content: Object) { },
      onDuplicate(content: Object) { },
      onMoveUp(content: Object) { },
      onMoveDown(content: Object) { },
      onPaste() { },
      props: this.props,
    };

    const translationEditor = React.createElement(
      getEditorByContentType('ContiguousText'), translationProps);

    const pronunciationProps = Object.assign({}, this.props, {
      model: pronunciation,
      onEdit: this.onPronunciationEdit.bind(this),
      onClick: () => { },
      onFocus: (m, p, t) => this.props.onFocus(m, pronunciationParent, t),
    });

    const pronunciationEditor = React.createElement(
      getEditorByContentType('ContiguousText'), pronunciationProps);

    const meaningEditors = this.props.model.meaning.size > 0
      ? <ContentContainer
        {...this.props}
        model={meanings}
        bindProperties={bindLabel}
        onEdit={this.onMeaningEdit.bind(this)}
      />
      : null;

    return (
      <div className={classNames([classes.definition, className])}>

        <button type="button"
          disabled={!editMode}
          onClick={this.onAddMeaning.bind(this)}
          className="btn btn-link">+ Add meaning</button>

        {meaningEditors}

        <div>Translation</div>
        {translationEditor}

        <div>Pronunciation</div>
        {pronunciationEditor}

      </div>
    );
  }
}

const StyledExtraDefinitionEditor = withStyles<ExtraDefinitionEditorProps>(styles)
  (ExtraDefinitionEditor);
export default StyledExtraDefinitionEditor;
