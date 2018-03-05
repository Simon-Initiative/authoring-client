import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from '../../../data/contentTypes';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import { PoolTitleEditor } from './PoolTitleEditor';
import { Select, TextInput } from '../common/controls';
import { AddQuestion } from '../question/AddQuestion';
import { PoolRefEditor } from './PoolRefEditor';
import { Skill } from 'types/course';
import { ContentTitle } from 'editors/content/common/ContentTitle.tsx';

import './SelectionEditor.scss';

export interface SelectionProps extends AbstractContentEditorProps<contentTypes.Selection> {
  onRemove: (guid: string) => void;
  isParentAssessmentGraded?: boolean;
  allSkills: Immutable.OrderedMap<string, Skill>;
}

export interface SelectionState {

}


/**
 * Selection Editor Component
 */
export class SelectionEditor
  extends AbstractContentEditor<contentTypes.Selection, SelectionProps, SelectionState> {

  constructor(props) {
    super(props);

    this.onStrategyChange = this.onStrategyChange.bind(this);
    this.onExhaustionChange = this.onExhaustionChange.bind(this);
    this.onScopeChange = this.onScopeChange.bind(this);
    this.onCountEdit = this.onCountEdit.bind(this);
    this.onSourceEdit = this.onSourceEdit.bind(this);
    this.onAddQuestion = this.onAddQuestion.bind(this);
    this.onTitleEdit = this.onTitleEdit.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (nextProps.model !== this.props.model);
  }

  onStrategyChange(strategy) {
    this.props.onEdit(this.props.model.with({ strategy }));
  }

  onExhaustionChange(exhaustion) {
    this.props.onEdit(this.props.model.with({ exhaustion }));
  }

  onScopeChange(scope) {
    this.props.onEdit(this.props.model.with({ scope }));
  }

  onCountEdit(selectionCount) {
    this.props.onEdit(this.props.model.with({ selectionCount }));
  }

  onSourceEdit(source) {
    this.props.onEdit(this.props.model.with({ source }));
  }

  renderSource() {
    if (this.props.model.source.contentType === 'PoolRef') {
      return <PoolRefEditor
               {...this.props}
               model={this.props.model.source}
               onEdit={this.onSourceEdit}
               onRemove={() => this.props.onRemove(this.props.model.guid)}
             />;
    }
  }

  onAddQuestion(question: contentTypes.Question) {
    if (this.props.model.source.contentType === 'Pool') {
      const source = this.props.model.source.with(
        { questions: this.props.model.source.questions
          .set(question.guid, question) });
      const updated = this.props.model.with({ source });
      this.props.onEdit(updated);
    }
  }

  onTitleEdit(title) {
    if (this.props.model.source.contentType === 'Pool') {
      const source = this.props.model.source.with({ title });
      this.props.onEdit(this.props.model.with({ source }));
    }
  }

  renderTitle() {
    const { model, onRemove } = this.props;

    const title = model.source.contentType === 'Pool'
      ? 'Pool' : 'Shared Pool';

    return (
      <ContentTitle title={title} onRemove={() => onRemove(model.guid)} canRemove={true} />
    );
  }

  render() : JSX.Element {
    const controls = (
      <div className="controls">
        {
          this.props.model.source.contentType === 'Pool' && (
            <div className="insert-toolbar">
              <span>Insert New:</span>
              <AddQuestion
                editMode={this.props.editMode}
                onQuestionAdd={this.onAddQuestion.bind(this)}
                isSummative={true}/>
            </div>
          )
        }
        <form className="form-inline">
          <Select editMode={this.props.editMode}
            label="Strategy" value={this.props.model.strategy}
            onChange={this.onStrategyChange}>
            <option value="random">Random</option>
            <option value="random_with_replace">Random with replace</option>
            <option value="ordered">Ordered</option>
          </Select>
          <Select editMode={this.props.editMode}
            label="Exhaustion" value={this.props.model.exhaustion}
            onChange={this.onExhaustionChange}>
            <option value="reuse">Reuse</option>
            <option value="skip">Skip</option>
            <option value="fail">Fail</option>
          </Select>
          <Select editMode={this.props.editMode}
            label="Scope" value={this.props.model.scope}
            onChange={this.onScopeChange}>
            <option value="section">Section</option>
            <option value="resource">Resource</option>
          </Select>

          Count:&nbsp;&nbsp;&nbsp;
          <TextInput
            editMode={this.props.editMode}
            width="75px"
            label="Count"
            value={this.props.model.selectionCount}
            type="number"
            onEdit={this.onCountEdit}
          />
        </form>
      </div>);

    let titleEditor = null;
    if (this.props.model.source.contentType === 'Pool') {
      titleEditor =
            <PoolTitleEditor
              {...this.props}
              services={this.props.services}
              context={this.props.context}
              editMode={this.props.editMode}
              model={this.props.model.source.title}
              onEdit={this.onTitleEdit}
            />;

    }

    return (
      <div className="selection-editor">
          {this.renderTitle()}

          {controls}

          {titleEditor}

          {this.renderSource()}

      </div>
    );
  }

}

