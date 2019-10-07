import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { withStyles, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps, RenderContext,
} from 'editors/content/common/AbstractContentEditor';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { ToolbarGroup } from 'components/toolbar/ContextAwareToolbar';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import { CONJUGATE_ELEMENTS } from 'data/content/learning/conjugate';
import { TextInput, Button } from 'editors/content/common/controls';
import { getEditorByContentType } from 'editors/content/container/registry';
import { Maybe } from 'tsmonad';
import { modalActions } from 'actions/modal';
import { buildUrl } from 'utils/path';
import { TextSelection } from 'types/active';
import { selectAudio } from 'editors/content/learning/AudioEditor';

import { styles } from 'editors/content/learning/conjugation/Conjugation.styles';

export interface ConjugateEditorProps
  extends AbstractContentEditorProps<contentTypes.ConjugationCell> {
  onShowSidebar: () => void;
}

export interface ConjugateEditorState {
  activeChildGuid: string;
}

/**
 * The content editor for table cells.
 */
class ConjugateEditor
  extends AbstractContentEditor<contentTypes.ConjugationCell,
  StyledComponentProps<ConjugateEditorProps, typeof styles>, ConjugateEditorState> {

  constructor(props) {
    super(props);

    this.state = {
      activeChildGuid: null,
    };

    this.onFocus = this.onFocus.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  componentWillReceiveProps(nextProps: ConjugateEditorProps) {
    const { activeChildGuid } = this.state;

    if (nextProps.activeContentGuid !== activeChildGuid) {
      this.setState({
        activeChildGuid: null,
      });
    }
  }

  onContentEdit(content, src) {

    if (this.props.model.contentType === 'CellHeader') {
      const model = this.props.model.with({ content });
      this.props.onEdit(model, src);
    } else {
      const model = this.props.model.with({ content });
      this.props.onEdit(model, src);
    }

  }

  onFocus(model: Object, parent, textSelection) {
    const { onFocus } = this.props;

    this.setState(
      { activeChildGuid: (model as any).guid },
      () => onFocus(model, parent, textSelection),
    );
  }

  render(): JSX.Element {

    const renderContext = this.props.renderContext === undefined
      ? RenderContext.MainEditor
      : this.props.renderContext;

    if (renderContext === RenderContext.Toolbar) {
      return this.renderToolbar();
    }
    if (renderContext === RenderContext.Sidebar) {
      return this.renderSidebar();
    }
    return (
      <div style={{ height: '100%' }}
        onFocus={e => this.handleOnFocus(e)} onClick={e => this.handleOnClick(e)}>
        {this.renderMain()}
      </div>
    );

  }

  onPronounsChange(model: contentTypes.Conjugate, pronouns) {
    this.props.onEdit(model.with({ pronouns }));
  }

  onSelect() {
    const { context, services, onEdit, model } = this.props;

    const dispatch = (services as any).dispatch;
    const dismiss = () => dispatch(modalActions.dismiss());
    const display = c => dispatch(modalActions.display(c));

    if (model.contentType === 'Conjugate') {
      const src1 = new contentTypes.Source().with({ src: model.src });
      const inputAudio = model.src !== ''
        ? new contentTypes.Audio().with({
          sources: Immutable.OrderedMap<string, contentTypes.Source>()
            .set(src1.guid, src1),
        })
        : null;

      selectAudio(inputAudio, context.resourcePath, context.courseModel, display, dismiss)
        .then((audio) => {
          if (audio !== null) {
            const src = audio.sources.first().src;
            const type = 'audio/mp3';
            if (model.contentType === 'Conjugate') {
              const updated = model.with({ src, type });
              onEdit(updated, updated);
            }
          }
        });
    }

  }

  onAudioRemove(model: contentTypes.Conjugate) {
    const updated = model.with({ src: '' });
    this.props.onEdit(updated, updated);
  }

  renderAudio(model: contentTypes.Conjugate) {

    let fullSrc = '';

    const src = model.src;
    fullSrc = buildUrl(
      this.props.context.baseUrl,
      this.props.context.courseModel.guid,
      this.props.context.resourcePath,
      src);

    return (
      <div>
        <audio src={fullSrc} controls={true} />
        <Button
          editMode={this.props.editMode}
          onClick={this.onAudioRemove.bind(this, model)}>Remove Audio</Button>
      </div>
    );

  }


  renderSidebarConjugate(model: contentTypes.Conjugate) {
    const { editMode } = this.props;
    const { pronouns } = model;

    const audio = model.src !== ''
      ? this.renderAudio(model)
      : <div>Select an audio file from the toolbar</div>;

    return (
      <SidebarContent title="Conjugate">
        <SidebarGroup label="Pronouns">
          <TextInput
            editMode={editMode}
            value={pronouns}
            type="text"
            width="100%"
            label=""
            onEdit={this.onPronounsChange.bind(this, model)}
          />
        </SidebarGroup>
        <SidebarGroup label="Audio">
          {audio}
        </SidebarGroup>
      </SidebarContent>
    );
  }

  renderSidebarHeader() {

    return (
      <SidebarContent title="Header">
      </SidebarContent>
    );
  }

  renderSidebar() {
    if (this.props.model.contentType === 'CellHeader') {
      return this.renderSidebarHeader();
    }
    return this.renderSidebarConjugate(this.props.model);
  }

  renderToolbarHeader() {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Conjugate Header"
        columns={5} highlightColor={CONTENT_COLORS.Conjugate}>
        <ToolbarButton onClick={() => onShowSidebar()} size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-th-list"></i></div>
          <div>Details</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }

  renderToolbarConjugate(model: contentTypes.Conjugate) {
    const { onShowSidebar } = this.props;

    return (
      <ToolbarGroup label="Conjugate"
        columns={5} highlightColor={CONTENT_COLORS.Conjugate}>
        <ToolbarButton onClick={this.onSelect} size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-music" /></div>
          <div>Select Audio</div>
        </ToolbarButton>
        <ToolbarButton onClick={() => onShowSidebar()} size={ToolbarButtonSize.Large}>
          <div><i className="fa fa-th-list"></i></div>
          <div>Details</div>
        </ToolbarButton>
      </ToolbarGroup>
    );
  }

  renderToolbar() {
    if (this.props.model.contentType === 'CellHeader') {
      return this.renderToolbarHeader();
    }
    return this.renderToolbarConjugate(this.props.model);
  }

  renderSimplifiedTextEditor() {
    const parent = {
      supportedElements: Immutable.List<string>(CONJUGATE_ELEMENTS),
      onEdit(content: Object, source: Object) {
        this.props.onEdit(this.props.model.with({ content }), source);
      },
      onAddNew(content: Object, textSelection: Maybe<TextSelection>) { },
      onRemove(content: Object) { },
      onDuplicate(content: Object) { },
      onMoveUp(content: Object) { },
      onMoveDown(content: Object) { },
      props: this.props,
    };

    const props = Object.assign({}, this.props, {
      hideBorder: true,
      model: this.props.model.content,
      onEdit: this.onContentEdit.bind(this),
      parent: this,
      onClick: () => { },
      onFocus: (m, p, t) => this.onFocus(m, parent, t),
    });

    return React.createElement(
      getEditorByContentType('ContiguousText'), props);
  }

  renderMain(): JSX.Element {
    const { className, classes, model, parent, activeContentGuid } = this.props;
    const { activeChildGuid } = this.state;

    const cellClass =
      activeContentGuid === model.guid
        ? classes.innerConjugateSelected : classes.innerConjugate;

    const bindProps = (element) => {

      if (element instanceof contentTypes.ContiguousText) {
        return [{ propertyName: 'hideBorder', value: true }];
      }
      return [];
    };

    let hideDecorator = false;
    if (model.content.contentType === 'ContiguousText') {
      hideDecorator = model.content.slateValue.document.nodes.size === 1;
    } else {
      hideDecorator = model.content.content.size === 0;
    }

    const contentEditor = this.props.model.contentType === 'Conjugate'
      ? this.renderSimplifiedTextEditor()
      : <ContentContainer
        {...this.props}
        onFocus={this.onFocus}
        hideSingleDecorator={hideDecorator}
        bindProperties={bindProps}
        model={this.props.model.content}
        onEdit={this.onContentEdit.bind(this)}
      />;

    return (
      <div className={classNames([
        cellClass, className, activeChildGuid && classes.innerConjugateChildSelected])}
        onClick={() => this.props.onFocus(model, parent, Maybe.nothing())}>
        <div>
          {contentEditor}
        </div>
        <i className={classNames(['far fa-caret-square-down', classes.selectConjugate])} />
      </div>
    );
  }

}

const StyledConjugateEditor = withStyles<ConjugateEditorProps>(styles)(ConjugateEditor);
export default StyledConjugateEditor;
