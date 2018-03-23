import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { AbstractEditor, AbstractEditorProps, AbstractEditorState } from '../common/AbstractEditor';
import { Resource } from 'data/content/resource';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import * as models from 'data/models';
import * as contentTypes from 'data/contentTypes';
import { ContextAwareToolbar } from 'components/toolbar/ContextAwareToolbar.controller';
import { Objectives } from './Objectives';
import { ContextAwareSidebar } from 'components/sidebar/ContextAwareSidebar.controller';
import { ActiveContext, ParentContainer, TextSelection } from 'types/active';
import { ContentElements } from 'data/content/common/elements';
import ContiguousTextEditor from 'editors/content/learning/ContiguousTextEditor.tsx';
import { ContiguousText } from 'data/content/learning/contiguous';

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
}

interface WorkbookPageEditorState extends AbstractEditorState {}

function hasMissingResource() : boolean {
  // TODO restore post wb fix
  return false;
}


class WorkbookPageEditor extends AbstractEditor<models.WorkbookPageModel,
  WorkbookPageEditorProps, WorkbookPageEditorState> {
  constructor(props: WorkbookPageEditorProps) {
    super(props, {});

    this.onModelEdit = this.onModelEdit.bind(this);
    this.onObjectivesEdit = this.onObjectivesEdit.bind(this);

    if (this.hasMissingObjective(
      props.model.head.objrefs, props.context.objectives)) {
      props.services.refreshObjectives(props.context.courseId);
    }
    if (hasMissingResource()) {
      props.services.refreshCourse(props.context.courseId);
    }
  }

  shouldComponentUpdate() {
    return true;
  }

  onModelEdit(model) {
    this.handleEdit(model);
  }

  onBodyEdit(content : any, source: Object) {
    const model = this.props.model.with({ body: content });

    this.props.onUpdateContent(this.props.context.documentId, source);

    this.handleEdit(model);
  }

  onTitleEdit(text: ContentElements) {

    const t = text.extractPlainText().caseOf({ just: s => s, nothing: () => '' });

    const resource = this.props.model.resource.with({ title: t });
    const title = this.props.model.head.title.with({ text });
    const head = this.props.model.head.with({ title });

    this.props.onEdit(this.props.model.with({ head, resource }));
  }

  hasMissingObjective(
    objrefs: Immutable.List<string>,
    objectives: Immutable.OrderedMap<string, contentTypes.LearningObjective>) {

    return objrefs
      .toArray()
      .some(id => !objectives.has(id));
  }

  componentWillReceiveProps(nextProps: WorkbookPageEditorProps) {

    if (nextProps.model !== this.props.model) {
      if (this.hasMissingObjective(
        nextProps.model.head.objrefs, nextProps.context.objectives)) {

        nextProps.services.refreshObjectives(nextProps.context.courseId);
      }
    }
  }

  onFocus(model, parent, textSelection) {
    this.props.onUpdateContentSelection(
      this.props.context.documentId, model, parent, textSelection);
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
        onUpdateHover={() => {}}
        model={this.props.model.head.objrefs}
        onFocus={() => {}}
        onEdit={this.onObjectivesEdit}/>
    );
  }

  render() {
    const { model, context, services, editMode, hover, onEdit, onUpdateHover } = this.props;

    const activeGuid = this.props.activeContext.activeChild.caseOf({
      just: c => (c as any).guid,
      nothing: () => '',
    });

    return (
      <div className="workbookpage-editor">
        <ContextAwareToolbar context={context} />
        <div className="wb-content">
          <div className="html-editor-well">

            <ContiguousTextEditor
              activeContentGuid={null}
              hover={null}
              onUpdateHover={() => {}}
              onFocus={() => {}}
              context={context}
              services={services}
              editMode={false}
              model={(model.head.title.text.content.first() as ContiguousText)}
              editorStyles={{ fontSize: 32 }}
              viewOnly
              onEdit={() => {}} />

            {this.renderObjectives()}
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
          </div>
          <ContextAwareSidebar
            context={context} services={services} editMode={editMode} model={model}
            onEditModel={onEdit} />
        </div>
      </div>
    );
  }

}

export default WorkbookPageEditor;
