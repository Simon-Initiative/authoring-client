import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import {
  AbstractEditor, AbstractEditorProps, AbstractEditorState,
} from 'editors/document/common/AbstractEditor';
import { Resource } from 'data/content/resource';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import * as models from 'data/models';
import * as contentTypes from 'data/contentTypes';
import { ContentElements } from 'data/content/common/elements';
import { ContextAwareToolbar } from 'components/toolbar/ContextAwareToolbar.controller';
import { Objectives } from 'editors/document/workbook/Objectives';
import { ContextAwareSidebar } from 'components/sidebar/ContextAwareSidebar.controller';
import { ActiveContext, ParentContainer, TextSelection } from 'types/active';
import { TitleTextEditor } from 'editors/content/learning/contiguoustext/TitleTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import * as Messages from 'types/messages';
import { buildMissingObjectivesMessage } from 'utils/error';
import { DEFAULT_OBJECTIVE_TITLE } from 'data/models/objective';

import './WorkbookPageEditor.scss';

export interface WorkbookPageEditorProps extends AbstractEditorProps<models.WorkbookPageModel> {
  fetchObjectives: (courseId: string) => void;
  preview: (courseId: string, resource: Resource) => Promise<any>;
  activeContext: ActiveContext;
  onUpdateContent: (documentId: string, content: Object) => void;
  onUpdateContentSelection: (
    documentId: string, content: Object, container: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
  hover: string;
  onUpdateHover: (hover: string) => void;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
}

interface WorkbookPageEditorState extends AbstractEditorState {
  collapseInsertPopup: boolean;
}

function hasMissingResource(): boolean {
  // TODO restore post wb fix
  return false;
}

const entryInstances = {
  Article: new contentTypes.Article(),
  Book: new contentTypes.Book(),
  Booklet: new contentTypes.Booklet(),
  Conference: new contentTypes.Conference(),
  InBook: new contentTypes.InBook(),
  InCollection: new contentTypes.InCollection(),
  InProceedings: new contentTypes.InProceedings(),
  Manual: new contentTypes.Manual(),
  MastersThesis: new contentTypes.MastersThesis(),
  PhdThesis: new contentTypes.PhdThesis(),
  Proceedings: new contentTypes.Proceedings(),
  TechReport: new contentTypes.TechReport(),
  Misc: new contentTypes.Misc(),
  Unpublished: new contentTypes.Unpublished(),
};


class WorkbookPageEditor extends AbstractEditor<models.WorkbookPageModel,
  WorkbookPageEditorProps, WorkbookPageEditorState> {

  noObjectivesMessage: Messages.Message;

  constructor(props: WorkbookPageEditorProps) {
    super(props, { collapseInsertPopup: true });

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onModelEdit = this.onModelEdit.bind(this);
    this.onObjectivesEdit = this.onObjectivesEdit.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.unFocus = this.unFocus.bind(this);
    this.addEntry = this.addEntry.bind(this);
    this.collapseInsertPopup = this.collapseInsertPopup.bind(this);

    if (this.hasMissingObjective(
      props.model.head.objrefs, props.context.objectives)) {
      props.services.refreshObjectives(props.context.courseId);
    }
    if (hasMissingResource()) {
      props.services.refreshCourse(props.context.courseId);
    }

  }

  hasMissingObjective(
    objrefs: Immutable.List<string>,
    objectives: Immutable.OrderedMap<string, contentTypes.LearningObjective>) {

    return objrefs
      .toArray()
      .some(id => !objectives.has(id));
  }

  componentDidMount() {
    super.componentDidMount();
    const { context, showMessage } = this.props;
    const { objectives, courseId } = context;

    if (objectives.size === 1 && objectives.first().title === DEFAULT_OBJECTIVE_TITLE ||
      objectives.size < 1) {
      this.noObjectivesMessage = buildMissingObjectivesMessage(courseId);
      showMessage(this.noObjectivesMessage);
    }
  }

  componentWillReceiveProps(nextProps: WorkbookPageEditorProps) {
    if (this.props.context.objectives.size <= 1 &&
      nextProps.context.objectives.size > 1 &&
      this.noObjectivesMessage !== undefined) {
      this.props.dismissMessage(this.noObjectivesMessage);
    }

    if (nextProps.model !== this.props.model) {
      if (this.hasMissingObjective(
        nextProps.model.head.objrefs, nextProps.context.objectives)) {
        nextProps.services.refreshObjectives(nextProps.context.courseId);
      }
    }
  }

  shouldComponentUpdate() {
    return true;
  }

  onModelEdit(model) {
    this.handleEdit(model);
  }

  onBodyEdit(content: any, source: Object) {
    const model = this.props.model.with({ body: content });
    this.props.onUpdateContent(this.props.context.documentId, source);

    this.handleEdit(model);
  }

  onEntryEdit(elements: ContentElements, src) {

    this.props.onUpdateContent(this.props.context.documentId, src);

    const items = elements
      .content
      .toArray()
      .map(e => [e.guid, e]);

    const bibliography = this.props.model.bibliography.with({
      bibEntries: Immutable.OrderedMap<string, contentTypes.Entry>(items),
    });

    const model = this.props.model.with({ bibliography });

    this.handleEdit(model);
  }

  onTitleEdit(ct: ContiguousText, src) {

    const t = ct.extractPlainText().caseOf({ just: s => s, nothing: () => '' });

    const resource = this.props.model.resource.with({ title: t });

    const content = this.props.model.head.title.text.content.set(ct.guid, ct);
    const text = this.props.model.head.title.text.with({ content });
    const title = this.props.model.head.title.with({ text });
    const head = this.props.model.head.with({ title });

    this.props.onEdit(this.props.model.with({ head, resource }));
  }

  onFocus(model, parent, textSelection) {
    this.props.onUpdateContentSelection(
      this.props.context.documentId, model, parent, textSelection);
  }

  unFocus() {
    this.props.onUpdateContentSelection(
      this.props.context.documentId, null, null, Maybe.nothing());
  }

  onObjectivesEdit(objrefs: Immutable.List<string>) {
    const head = this.props.model.head.with({ objrefs });
    this.handleEdit(this.props.model.with({ head }));
  }

  renderObjectives() {
    return (
      <Objectives
        {...this.props}
        activeContentGuid={null}
        hover={null}
        onUpdateHover={() => { }}
        model={this.props.model.head.objrefs}
        onFocus={() => { }}
        onEdit={this.onObjectivesEdit} />
    );
  }

  addEntry(e) {
    const bibEntries = this.props.model.bibliography.bibEntries.set(e.guid, e);
    const bibliography = this.props.model.bibliography.with({ bibEntries });
    const model = this.props.model.with({ bibliography });

    this.handleEdit(model);
  }


  collapseInsertPopup() {
    this.setState({
      collapseInsertPopup: !this.state.collapseInsertPopup,
    });
  }

  renderBibliography() {

    const { model, hover, onUpdateHover } = this.props;

    const activeGuid = this.props.activeContext.activeChild.caseOf({
      just: c => (c as any).guid,
      nothing: () => '',
    });

    const elements = new ContentElements().with({
      content: model.bibliography.bibEntries,
    });

    const containerOrNone = model.bibliography.bibEntries.size > 0
      ? <ContentContainer
        parent={null}
        activeContentGuid={activeGuid}
        hover={hover}
        onUpdateHover={onUpdateHover}
        onFocus={this.onFocus.bind(this)}
        editMode={this.props.editMode}
        services={this.props.services}
        context={this.props.context}
        model={elements}
        onEdit={this.onEntryEdit.bind(this)}
      />
      : null;

    const entryChoices = Object.keys(entryInstances).map((key) => {
      return (
        <a onClick={(e) => { e.preventDefault(); this.addEntry(entryInstances[key]); }}
          className="dropdown-item">{key}</a>
      );
    });

    return (
      <div className="bibliography">
        <div>
          <span className="wbLabel inline">Bibliography</span>&nbsp;&nbsp;
          <span className="badge badge-primary">
            {this.props.model.bibliography.bibEntries.size}
          </span>
          <button className="btn btn-link" type="button" data-toggle="collapse"
            data-target="#bibContent" aria-expanded="false" aria-controls="bibContent">
            Show / Hide
          </button>
        </div>
        <div className="collapse" id="bibContent">
          {containerOrNone}
          <div className={`insert-popup ${this.state.collapseInsertPopup ? 'collapsed' : ''}`}>
            {entryChoices}
          </div>
          <a onClick={this.collapseInsertPopup} className="insert-new">Insert new...</a>
        </div>
      </div>
    );
  }

  render() {
    const { model, context, services, editMode, hover,
      onEdit, onUpdateHover } = this.props;

    const activeGuid = this.props.activeContext.activeChild.caseOf({
      just: c => (c as any).guid,
      nothing: () => '',
    });

    return (
      <div className="workbookpage-editor">
        <ContextAwareToolbar editMode={editMode} context={context} model={model} />
        <div className="wb-content">
          <div className="html-editor-well" onClick={() => this.unFocus()}>

            <TitleTextEditor
              context={context}
              services={services}
              onFocus={() => this.unFocus()}
              model={(model.head.title.text.content.first() as ContiguousText)}
              editMode={editMode}
              onEdit={this.onTitleEdit}
              editorStyles={{ fontSize: 32 }} />

            {this.renderObjectives()}

            <span className="wbLabel">Content</span>

            <ContentContainer
              parent={null}
              activeContentGuid={activeGuid}
              hover={hover}
              onUpdateHover={onUpdateHover}
              onFocus={this.onFocus.bind(this)}
              editMode={this.props.editMode}
              services={this.props.services}
              context={this.props.context}
              model={this.props.model.body}
              onEdit={(c, s) => this.onBodyEdit(c, s)} />

            {this.renderBibliography()}

          </div>
          <ContextAwareSidebar
            context={context}
            services={services}
            editMode={editMode}
            model={model}
            onEditModel={onEdit} />
        </div>
      </div>
    );
  }

}

export default WorkbookPageEditor;
