import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { injectSheet, classNames } from 'styles/jss';
import { StyledComponentProps } from 'types/component';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';

import { Select } from 'editors/content/common/controls';
import { ContentElements, MATERIAL_ELEMENTS, BOX_ELEMENTS } from 'data/content/common/elements';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { TitleTextEditor } from 'editors/content/learning/contiguoustext/TitleTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import { CONTENT_COLORS } from 'editors/content/utils/content';
import createGuid from 'utils/guid';
import { styles } from './Theorem.styles';
import { TheoremType } from 'data/content/learning/theorem';

export interface TheoremEditorProps
  extends AbstractContentEditorProps<contentTypes.Theorem> {
  onShowSidebar: () => void;

}

export interface TheoremEditorState {

}

@injectSheet(styles)
export default class TheoremEditor
  extends AbstractContentEditor<contentTypes.Theorem,
  StyledComponentProps<TheoremEditorProps>, TheoremEditorState> {

  constructor(props) {
    super(props);

    this.onTitleEdit = this.onTitleEdit.bind(this);
    this.onTypeChange = this.onTypeChange.bind(this);
  }

  renderSidebar() {
    return (
      <SidebarContent title="Theorem" />
    );
  }


  renderToolbar(): JSX.Element {
    return (
      <ToolbarGroup label="Theorem" columns={5} highlightColor={CONTENT_COLORS.Theorem}>
        <ToolbarLayout.Column>
          <span>Type</span>
          <Select editMode={this.props.editMode}
            value={this.props.model.theoremType}
            onChange={this.onTypeChange}>
            <option value={TheoremType.Axiom}>Axiom</option>
            <option value={TheoremType.Corollary}>Corollary</option>
            <option value={TheoremType.Hypothesis}>Hypothesis</option>
            <option value={TheoremType.Law}>Law</option>
            <option value={TheoremType.Lemma}>Lemma</option>
            <option value={TheoremType.Principle}>Principle</option>
            <option value={TheoremType.Proposition}>Proposition</option>
            <option value={TheoremType.Rule}>Rule</option>
            <option value={TheoremType.Theorem}>Theorem</option>
          </Select>
        </ToolbarLayout.Column>
      </ToolbarGroup>
    );
  }


  onTypeChange(theoremType) {
    const model = this.props.model.with({
      theoremType,
    });
    this.props.onEdit(model, model);
  }


  onStatementEdit(elements, src) {

    const items = elements
      .content
      .toArray()
      .map(e => [e.guid, e]);

    const model = this.props.model.with({
      statements: Immutable.OrderedMap
        <string, contentTypes.Statement>(items),
    });

    this.props.onEdit(model, src);
  }

  onProofExampleEdit(elements, src) {

    const items = elements
      .content
      .toArray()
      .map(e => [e.guid, e]);

    const model = this.props.model.with({
      proofsOrExamples: Immutable.OrderedMap
        <string, contentTypes.Proof | contentTypes.Example>(items),
    });

    this.props.onEdit(model, src);
  }


  onTitleEdit(ct: ContiguousText, sourceObject) {
    const content = this.props.model.title.text.content.set(ct.guid, ct);
    const text = this.props.model.title.text.with({ content });
    const title = this.props.model.title.with({ text });
    const model = this.props.model.with({ title });

    this.props.onEdit(model, sourceObject);
  }

  onAddStatement() {

    const s = new contentTypes.Statement(
      { content: ContentElements.fromText('', createGuid(), MATERIAL_ELEMENTS) });
    const model = this.props.model.with({
      statements: this.props.model.statements.set(s.guid, s),
    });

    this.props.onEdit(model, s);
  }

  onAddProof() {

    const s = new contentTypes.Proof(
      { content: ContentElements.fromText('', createGuid(), MATERIAL_ELEMENTS) });
    const model = this.props.model.with({
      proofsOrExamples: this.props.model.proofsOrExamples.set(s.guid, s),
    });

    this.props.onEdit(model, s);
  }

  onAddExample() {

    const s = new contentTypes.Example(
      { content: ContentElements.fromText('', createGuid(), BOX_ELEMENTS) });
    const model = this.props.model.with({
      proofsOrExamples: this.props.model.proofsOrExamples.set(s.guid, s),
    });

    this.props.onEdit(model, s);
  }

  renderMain(): JSX.Element {

    const { model, classes, className } = this.props;

    const statements = new ContentElements().with({
      content: model.statements,
    });

    const statementEditors = model.statements.size > 0
      ? <ContentContainer
        {...this.props}
        model={statements}
        onEdit={this.onStatementEdit.bind(this)}
      />
      : null;


    const pe = new ContentElements().with({
      content: model.proofsOrExamples,
    });

    const peEditors = model.proofsOrExamples.size > 0
      ? <ContentContainer
        {...this.props}
        model={pe}
        onEdit={this.onProofExampleEdit.bind(this)}
      />
      : null;

    return (
      <div className={classNames([classes.theorem, className])}>
        <TitleTextEditor
          context={this.props.context}
          services={this.props.services}
          onFocus={this.props.onFocus}
          model={(this.props.model.title.text.content.first() as ContiguousText)}
          editMode={this.props.editMode}
          onEdit={this.onTitleEdit}
          editorStyles={{ fontSize: 20 }} />
        <button type="button"
          disabled={!this.props.editMode}
          onClick={this.onAddStatement.bind(this)}
          className="btn btn-link">+ Add statement</button>
        <button type="button"
          disabled={!this.props.editMode}
          onClick={this.onAddProof.bind(this)}
          className="btn btn-link">+ Add proof</button>
        <button type="button"
          disabled={!this.props.editMode}
          onClick={this.onAddExample.bind(this)}
          className="btn btn-link">+ Add example</button>
        {statementEditors}
        {peEditors}
      </div>
    );
  }

}
