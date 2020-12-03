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

import { getEditorByContentType } from 'editors/content/container/registry';
import { Editor } from 'slate';
import { modalActions } from 'actions/modal';
import { Maybe } from 'tsmonad';
import { CONTENT_COLORS, getContentIcon, insertableContentTypes } from
  'editors/content/utils/content';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import {
  DiscoverableId,
} from 'components/common/Discoverable.controller';

import { selectAudio } from './AudioEditor';
import { styles } from 'editors/content/learning/Definition.styles';

export interface ExtraDefinitionEditorProps
  extends AbstractContentEditorProps<contentTypes.Extra> {
  onShowSidebar: () => void;
  onDiscover: (id: DiscoverableId) => void;
}

export interface ExtraDefinitionEditorState {
  model: contentTypes.Extra;
}

/**
 * The content editor for definitions.
 */
class ExtraDefinitionEditor
  extends AbstractContentEditor<contentTypes.Extra,
  StyledComponentProps<ExtraDefinitionEditorProps, typeof styles>, ExtraDefinitionEditorState> {

  constructor(props) {
    super(props);

    this.state = { model: this.props.model };

    this.onSaveChanges = this.onSaveChanges.bind(this);
    this.onEdit = this.onEdit.bind(this);
  }

  renderSidebar() {

    if (this.state.model.isDefinition()) {
      return (
        <SidebarContent title="Rollover Definition">
          <strong>Audio: </strong>
            {
              this.state.model.pronunciation.src.caseOf({
                just: src => src.substr(src.lastIndexOf('/') + 1),
                nothing: () => 'None Set',
              })
            }
          <button onClick={this.onSelectAudio.bind(this)} className="btn btn-primary">
              <div>{getContentIcon(insertableContentTypes.Audio)}</div>
              <div>Pronounciation Audio</div>
          </button>
        </SidebarContent>
      );
    }
    return (
      <SidebarContent title="Rollover Content">
      </SidebarContent>
    );

  }

  onSelectAudio() {
    const { context, services } = this.props;

    const dispatch = (services as any).dispatch;
    const dismiss = () => dispatch(modalActions.dismiss());
    const display = c => dispatch(modalActions.display(c));

    const inputAudio = this.state.model.pronunciation.src.caseOf({
      just: (src) => {
        const src1 = new contentTypes.Source().with({ src });
        return new contentTypes.Audio().with({
          sources: Immutable.OrderedMap<string, contentTypes.Source>()
            .set(src1.guid, src1),
        });
      },
      nothing: () => null,
    });

    selectAudio(inputAudio, context.resourcePath, context.courseModel, display, dismiss)
      .then((audio) => {
        if (audio !== null) {
          const src = audio.sources.first().src;
          const type = 'audio/mpeg';

          const pronunciation = this.state.model.pronunciation.with(
            { src: Maybe.just(src), srcContentType: Maybe.just(type) });
          const model = this.state.model.with({ pronunciation });

          this.props.onEdit(model, null);
        }
      });
  }

  renderToolbar() {

    return (
      <ToolbarGroup label="Rollover">
      </ToolbarGroup>
    );
  }

  onAddMeaning() {

    const material = contentTypes.Material.fromText('', '');
    const meaning = new contentTypes.Meaning({ material });
    const model = this.state.model.with({
      meaning: this.state.model.meaning.set(meaning.guid, meaning),
    });

    this.onEdit(model);
  }

  onMeaningEdit(elements, src) {

    if (elements.content.size > 0) {
      const items = elements
        .content
        .toArray()
        .map(e => [e.guid, e]);

      const model = this.state.model.with({
        meaning: Immutable.OrderedMap<string, contentTypes.Meaning>(items),
      });

      this.onEdit(model);
    } else if (elements.content.size === 0) {

      const model = this.state.model.with({
        meaning: Immutable.OrderedMap<string, contentTypes.Meaning>(),
      });

      this.onEdit(model);
    }

  }

  onTranslationEdit(translation, src) {

    const model = this.state.model.with({
      translation,
    });

    this.onEdit(model);

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
    const model = this.state.model.with({ content });
    this.onEdit(model);
  }

  renderMain(): JSX.Element {
    const { model } = this.state;

    if (model.isDefinition()) {
      return this.renderAsDefinition();
    }
    return this.renderAsContent();
  }

  renderAsContent(): JSX.Element {

    const { className, classes } = this.props;

    return (
      <div className={classNames([classes.definition, className])}>

        <button className="btn btn-primary" onClick={() => this.onSaveChanges()}>
          Save Changes
        </button>

        <ContentContainer
          {...this.props}
          model={this.state.model.content}
          onEdit={this.onContentEdit.bind(this)}
        />

      </div>
    );
  }

  onSaveChanges() {
    this.props.onEdit(this.state.model);
  }

  onEdit(model) {
    this.setState({ model });
  }

  renderAsDefinition(): JSX.Element {

    const { className, classes, editMode } = this.props;
    const { model } = this.state;

    const getLabel = (e, i) => <span>{e.contentType + ' ' + (i + 1)}</span>;

    const { translation } = model;

    const meanings = new ContentElements().with({
      content: model.meaning,
    });

    const labels = {};
    model.meaning.toArray().map((e, i) => labels[e.guid] = getLabel(e, i));

    const bindLabel = el => [{ propertyName: 'label', value: labels[el.guid] }];

    const translationParent = {
      supportedElements: Immutable.List<string>(TEXT_ELEMENTS),
      onEdit(content: Object, source: Object) {
        this.onEdit(this.state.model.with({ translation: content }));
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

    const translationEditor = React.createElement(
      getEditorByContentType('Translation'), translationProps);


    const meaningEditors = this.state.model.meaning.size > 0
      ? <ContentContainer
        {...this.props}
        model={meanings}
        bindProperties={bindLabel}
        onEdit={this.onMeaningEdit.bind(this)}
      />
      : null;

    return (
      <div className={classNames([classes.definition, className])}>

        <button className="btn btn-primary" onClick={() => this.onSaveChanges()}>
          Save Changes
        </button>

        {meaningEditors}

        <br/><b>OR</b><br/><br/>

        {translationEditor}

      </div>
    );
  }
}

const StyledExtraDefinitionEditor = withStyles<ExtraDefinitionEditorProps>(styles)
  (ExtraDefinitionEditor);
export default StyledExtraDefinitionEditor;
