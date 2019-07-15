import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { Select, TextInput } from 'editors/content/common/controls';
import { AddQuestion } from 'editors/content/question/addquestion/AddQuestion.controller';
import PoolRefEditor from 'editors/content/selection/PoolRefEditor.controller';
import { Skill } from 'types/course';
import { ContentTitle } from 'editors/content/common/ContentTitle';
import { TitleTextEditor } from 'editors/content/learning/contiguoustext/TitleTextEditor';
import { ContiguousText } from 'data/content/learning/contiguous';
import { REMOVE_QUESTION_DISABLED_MSG } from 'editors/content/question/question/Question';

import './SelectionEditor.scss';
import { LegacyTypes } from 'data/types';
import { ToggleSwitch } from 'components/common/ToggleSwitch';

export interface SelectionProps extends AbstractContentEditorProps<contentTypes.Selection> {
  onRemove: (guid: string) => void;
  onDuplicate?: () => void;
  allSkills: Immutable.OrderedMap<string, Skill>;
  canRemove: boolean;
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

  /** Override Parent Method */
  handleOnClick(e) {
    if (this.props.onHandleClick !== undefined) {
      this.props.onHandleClick(e);
    }
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

  onCountEdit(selectionCount: string) {
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
      const source = this.props.model.source.with({
        questions: this.props.model.source.questions
          .set(question.guid, question),
      });
      const updated = this.props.model.with({ source });
      this.props.onEdit(updated);
    }
  }

  onTitleEdit(ct: ContiguousText, sourceObject) {

    if (this.props.model.source.contentType === 'Pool') {
      const content = this.props.model.source.title.text.content.set(ct.guid, ct);
      const text = this.props.model.source.title.text.with({ content });
      const title = this.props.model.source.title.with({ text });
      const source = this.props.model.source.with({ title });
      const model = this.props.model.with({ source });

      this.props.onEdit(model, sourceObject);
    }
  }

  renderTitle() {
    const { model, canRemove, editMode, onRemove } = this.props;

    const title = model.source.contentType === 'Pool'
      ? 'Pool' : 'Shared Pool';

    return (
      <ContentTitle
        title={title}
        editMode={editMode}
        onRemove={() => onRemove(model.guid)}
        canRemove={canRemove}
        removeDisabledMessage={REMOVE_QUESTION_DISABLED_MSG} />
    );
  }

  renderSidebar() {
    return null;
  }
  renderToolbar() {
    return null;
  }

  renderMain(): JSX.Element {

    const controls = (
      <div className="controls">
        {
          this.props.model.source.contentType === 'Pool' && (
            <div className="insert-toolbar">
              <span>Add new question:</span>
              <AddQuestion
                editMode={this.props.editMode}
                onQuestionAdd={this.onAddQuestion.bind(this)}
                assessmentType={LegacyTypes.assessment2_pool} />
              <br />
            </div>
          )
        }
        <div className="pool-options">
          <div className="option">
            <Select editMode={this.props.editMode}
              label="Selection Strategy" value={this.props.model.strategy}
              onChange={this.onStrategyChange}>
              <option value="random">Random</option>
              <option value="random_with_replace">Random (allow duplicates)</option>
              <option value="ordered">In order</option>
            </Select>
          </div>
          <div className="option">
            <Select editMode={this.props.editMode}
              label="On Question Exhaustion" value={this.props.model.exhaustion}
              onChange={this.onExhaustionChange}>
              <option value="reuse">Reuse</option>
              <option value="skip">Skip</option>
              <option value="fail">Fail</option>
            </Select>
          </div>
          <div className="option">
            <Select editMode={this.props.editMode}
              label="Scope" value={this.props.model.scope}
              onChange={this.onScopeChange}>
              <option value="section">Section</option>
              <option value="resource">Resource</option>
            </Select>
          </div>
          <div className="option">
            <div>Question Count</div>
            <div>
              <TextInput
                editMode={this.props.editMode && this.props.model.selectionCount !== '*'}
                width="75px"
                label=""
                style={{ display: 'inline', marginRight: 10 }}
                value={this.props.model.selectionCount === '*'
                  ? ''
                  : this.props.model.selectionCount
                }
                type="number"
                onEdit={(value) => {
                  if (Number(value) < 0) {
                    return;
                  }
                  this.onCountEdit(value);
                }} />

              <ToggleSwitch
                checked={this.props.model.selectionCount === '*'}
                editMode={this.props.editMode}
                label="Include all questions from this pool"
                onClick={() => {
                  if (this.props.model.selectionCount === '*') {
                    this.onCountEdit('1');
                  } else {
                    this.onCountEdit('*');
                  }
                }} />
            </div>
          </div>
        </div>
      </div>);

    let titleEditor = null;
    if (this.props.model.source.contentType === 'Pool') {
      titleEditor =
        <TitleTextEditor
          {...this.props}
          model={(this.props.model.source
            .title.text.content.first() as ContiguousText)}
          onEdit={this.onTitleEdit}
          editorStyles={{ fontSize: 20 }} />;
    }

    return (
      <div className="selection-editor">
        {this.renderTitle()}

        <br />

        {titleEditor}

        {this.renderSource()}

        {controls}

      </div>
    );
  }

}

