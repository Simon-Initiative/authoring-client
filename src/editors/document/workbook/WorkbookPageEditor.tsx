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

import { EntityTypes } from 'data/content/learning/common';
import { ActiveContext, ParentContainer, TextSelection } from 'types/active';
import { TitleTextEditor } from 'editors/content/learning/contiguoustext/TitleTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import * as Messages from 'types/messages';
import { buildMissingObjectivesMessage } from 'utils/error';
import { DEFAULT_OBJECTIVE_TITLE } from 'data/models/objective';
import { entryInstances } from 'editors/content/learning/bibliography/utils';
import createGuid from 'utils/guid';
import { map } from 'data/utils/map';
import { ContentElement } from 'data/content/common/interfaces';
import { SidebarToggle } from 'editors/common/SidebarToggle.controller';
import './WorkbookPageEditor.scss';
import { MessageState } from 'reducers/messages';
import { CourseIdVers, LegacyTypes } from 'data/types';

export interface WorkbookPageEditorProps extends AbstractEditorProps<models.WorkbookPageModel> {
  fetchObjectives: (courseId: CourseIdVers) => void;
  preview: (courseId: CourseIdVers, resource: Resource) => Promise<any>;
  activeContext: ActiveContext;
  onUpdateContent: (documentId: string, content: Object) => void;
  onUpdateContentSelection: (
    documentId: string, content: Object, container: ParentContainer,
    textSelection: Maybe<TextSelection>) => void;
  hover: string;
  messages: MessageState;
  onUpdateHover: (hover: string) => void;
  showMessage: (message: Messages.Message) => void;
  dismissMessage: (message: Messages.Message) => void;
  setOrderedIds: (ids: Immutable.Map<string, number>) => void;
}

interface WorkbookPageEditorState extends AbstractEditorState {
  collapseInsertPopup: boolean;
}

function hasMissingResource(): boolean {
  // TODO restore post wb fix
  return false;
}


function toOrderedIds(bib: contentTypes.Bibliography): Immutable.Map<string, number> {
  return Immutable.Map(bib.bibEntries.toArray().map((e, i) => [e.id, i]));
}

function isStructurallyDifferent(bib1: contentTypes.Bibliography, bib2: contentTypes.Bibliography) {
  if (bib1.bibEntries.size !== bib2.bibEntries.size) {
    return true;
  }
  const arr1 = bib1.bibEntries.toArray();
  bib1.bibEntries.toArray().forEach((c, i) => {
    if (arr1[i].id !== c.id) {
      return true;
    }
  });
  return false;
}

class WorkbookPageEditor extends AbstractEditor<models.WorkbookPageModel,
  WorkbookPageEditorProps, WorkbookPageEditorState> {

  noObjectivesMessage: Messages.Message;
  workbookPages: Immutable.OrderedMap<string, any>;
  // coursePrereqs: Object;
  // coursePostreqs: Object;
  // prereqRefs: Immutable.List<string>;

  constructor(props: WorkbookPageEditorProps) {
    super(props, { collapseInsertPopup: true });

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onModelEdit = this.onModelEdit.bind(this);
    this.onObjectivesEdit = this.onObjectivesEdit.bind(this);
    // this.onPrereqsEdit = this.onPrereqsEdit.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.unFocus = this.unFocus.bind(this);
    this.addEntry = this.addEntry.bind(this);
    this.collapseInsertPopup = this.collapseInsertPopup.bind(this);

    if (this.hasMissingObjective(
      props.model.head.objrefs, props.context.objectives)) {
      props.services.refreshObjectives(props.context.courseModel.idvers);
    }
    if (hasMissingResource()) {
      props.services.refreshCourse(props.context.courseModel.idvers);
    }

    // this.coursePrereqs = JSON.parse(localStorage.getItem(this.props.context.courseModel.id
    //   + this.props.context.courseModel.version)) || {};

    // this.coursePostreqs = this.createPostreqs(this.coursePrereqs);

    // this.prereqRefs = this.coursePrereqs && this.coursePrereqs[this.props.model.resource.id]
    //   ? Immutable.List<string>(this.coursePrereqs[this.props.model.resource.id])
    //   : Immutable.List<string>();

    this.workbookPages = this.props.context.courseModel.resourcesById
      .filter(r => r.type === LegacyTypes.workbook_page && r.id !== this.props.model.resource.id)
      .toOrderedMap() as Immutable.OrderedMap<string, any>;
  }

  // createPostreqs = (prereqs: Object) => {
  //   const postreqs = {};
  //   Object.keys(prereqs).forEach((child) => {
  //     const parents = prereqs[child];
  //     parents.forEach((parent) => {
  //       if (!postreqs[parent]) {
  //         postreqs[parent] = [child];
  //       } else {
  //         if (postreqs[parent].indexOf(child) === -1) {
  //           postreqs[parent].push(child);
  //         }
  //       }
  //     });
  //   });
  //   return postreqs;
  // }

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
    const { objectives, courseModel } = context;

    if (objectives.size === 1 && objectives.first().title === DEFAULT_OBJECTIVE_TITLE
      || objectives.size < 1) {
      this.noObjectivesMessage =
        buildMissingObjectivesMessage(courseModel.idvers, context.orgId);
      showMessage(this.noObjectivesMessage);
    }

    this.props.setOrderedIds(toOrderedIds(this.props.model.bibliography));
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
        nextProps.services.refreshObjectives(nextProps.context.courseModel.idvers);
      }
    }

    if (isStructurallyDifferent(this.props.model.bibliography, nextProps.model.bibliography)) {
      this.props.setOrderedIds(toOrderedIds(nextProps.model.bibliography));
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
    let model = this.props.model.with({ bibliography });

    if (bibliography.bibEntries.size < this.props.model.bibliography.bibEntries.size) {
      // Find the item that was removed, and remove the citations
      // that reference it. There can be zero, one, or many citations
      // that reference a specific entry.
      const updated = bibliography.bibEntries.toArray().reduce(
        (p, e) => {
          p[e.guid] = e;
          return p;
        },
        {},
      );

      const remove = (id, e) => {
        if ('ContiguousText' === e.contentType) {
          const ct = e as ContiguousText;
          const citations = ct.getEntitiesByType(EntityTypes.cite);
          const matched = citations.filter(c => c.entity.getData().entry === id);

          return matched.reduce(
            (ct, e) => ct.removeEntity(e.entityKey),
            ct,
          );
        }
        return e;
      };
      this.props.model.bibliography.bibEntries.toArray().forEach((e) => {
        if (updated[e.guid] === undefined) {
          model = map(remove.bind(undefined, e.id), (model as any) as ContentElement) as any;
        }
      });

    }

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

  // onPrereqsEdit(prereqRefs: Immutable.List<string>) {
  //   const { context, model } = this.props;
  //   const { courseModel } = context;

  //   const courseKey = courseModel.id + courseModel.version;
  //   const anyExistingPrereqs: null | Object = localStorage.getItem(courseKey)
  //     && JSON.parse(localStorage.getItem(courseKey));

  //   if (anyExistingPrereqs) {
  //     anyExistingPrereqs[model.resource.id] = prereqRefs.toArray();
  //     localStorage.setItem(courseKey, JSON.stringify(anyExistingPrereqs));
  //   } else {
  //     localStorage.setItem(courseKey, JSON.stringify(
  //       { [model.resource.id]: prereqRefs.toArray() },
  //     ));
  //   }
  // }

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

  // renderPrerequisites() {
  //   return (
  //     <Prerequisites
  //       {...this.props}
  //       activeContentGuid={null}
  //       hover={null}
  //       onUpdateHover={() => { }}
  //       model={this.prereqRefs}
  //       workbookPages={this.workbookPages}
  //       coursePrereqs={this.coursePrereqs}
  //       coursePostreqs={this.coursePostreqs}
  //       onFocus={() => { }}
  //       onEdit={this.onPrereqsEdit} />
  //   );
  // }

  addEntry(rawEntry) {

    const e = rawEntry.with({ id: createGuid() });
    const bibEntries = this.props.model.bibliography.bibEntries.set(e.guid, e);
    const bibliography = this.props.model.bibliography.with({ bibEntries });
    const model = this.props.model.with({ bibliography });

    this.handleEdit(model);
  }

  collapseInsertPopupFn = (e) => {
    if (e.originator !== 'insertPopupToggle') {
      this.setState({
        collapseInsertPopup: true,
      });
      window.removeEventListener('click', this.collapseInsertPopupFn);
    }
  }

  collapseInsertPopup(e) {
    (e.nativeEvent as any).originator = 'insertPopupToggle';

    if (this.state.collapseInsertPopup) {
      window.addEventListener('click', this.collapseInsertPopupFn);
    } else {
      window.removeEventListener('click', this.collapseInsertPopupFn);
    }

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


    const getLabel = (e, i) => (i + 1);

    const labels = {};

    model.bibliography.bibEntries.toArray().map((e, i) => {
      labels[e.guid]
        = <span style={{ display: 'inline-block', minWidth: '12px' }}>{getLabel(e, i)}</span>;
    });

    const bindLabel = el => [{ propertyName: 'label', value: labels[el.guid] }];

    const containerOrNone = model.bibliography.bibEntries.size > 0
      ? <ContentContainer
        parent={null}
        activeContentGuid={activeGuid}
        hover={hover}
        onUpdateHover={onUpdateHover}
        onFocus={this.onFocus.bind(this)}
        editMode={this.props.editMode}
        bindProperties={bindLabel}
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
            <SidebarToggle />

            <TitleTextEditor
              context={context}
              services={services}
              onFocus={() => this.unFocus()}
              model={(model.head.title.text.content.first() as ContiguousText)}
              editMode={editMode}
              onEdit={this.onTitleEdit}
              editorStyles={{ fontSize: 32 }} />

            {this.renderObjectives()}

            {/* {this.renderPrerequisites()} */}

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
