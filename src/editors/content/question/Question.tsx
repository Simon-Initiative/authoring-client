import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { AbstractItemPartEditorProps } from '../common/AbstractItemPartEditor';
import { Button, Select } from '../common/controls';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';
import InlineInsertionToolbar from '../html/InlineInsertionToolbar';
import { CommandProcessor } from '../common/command';
import { EditorState } from 'draft-js';
import {
  TabContainer, Tab, TabElement, TabSection, TabSectionHeader, TabSectionContent, TabOptionControl,
} from 'editors/content/common/TabContainer';
import { Hints } from '../part/Hints';
import { ExplanationEditor } from '../part/ExplanationEditor';
import ConceptsEditor from '../concepts/ConceptsEditor';
import { CriteriaEditor } from '../question/CriteriaEditor';
import { Skill } from 'types/course';
import { ContentTitle } from 'editors/content/common/ContentTitle.tsx';

import './Question.scss';

export interface QuestionProps<ModelType>
  extends AbstractItemPartEditorProps<ModelType> {
  onBodyEdit: (...args: any[]) => any;
  body: any;
  grading: any;
  onGradingChange: (value) => void;
  hideGradingCriteria: boolean;
  allSkills: Immutable.OrderedMap<string, Skill>;
  model: contentTypes.Question;
  onRemoveQuestion: () => void;
}

export interface QuestionState {

}

const getLabelForQuestion = (question: contentTypes.Question): string => {
  if (question.items.size === 0) {
    return 'Input Question';
  }

  // Look at first item and base label off of that
  const item = question.items.first();

  switch (item.contentType) {
    case 'MultipleChoice':
      if (item.select === 'single') {
        return 'Multiple Choice Question';
      }

      return 'Check All That Apply Question';
    case 'Ordering':
      return 'Ordering Question';
    case 'Essay':
      return 'Essay Question';
    case 'ShortAnswer':
      return 'Short Answer Question';
    case 'Text':
    case 'Numeric':
    case 'FillInTheBlank':
      return 'Input Question';
    default:
      return 'Question';
  }
};

export const OptionControl = TabOptionControl;

/**
 * Question Component
 */
export abstract class Question<P extends QuestionProps<contentTypes.QuestionItem>,
  S extends QuestionState> extends React.Component<P, S> {
  htmlEditor: CommandProcessor<EditorState>;
  className: string;

  constructor(props) {
    super(props);

    this.onCriteriaAdd = this.onCriteriaAdd.bind(this);
    this.onCriteriaRemove = this.onCriteriaRemove.bind(this);
    this.onCriteriaEdit = this.onCriteriaEdit.bind(this);
    this.onConceptsEdit = this.onConceptsEdit.bind(this);
    this.onHintsEdit = this.onHintsEdit.bind(this);
    this.onExplanationEdit = this.onExplanationEdit.bind(this);
  }

  abstract renderDetails(): JSX.Element | boolean;
  abstract renderAdditionalTabs(): TabElement[] | boolean;
  abstract getClassName(): string;

  onCriteriaAdd() {
    const c = new contentTypes.GradingCriteria();
    const criteria = this.props.partModel.criteria.set(c.guid, c);
    this.props.onEdit(this.props.itemModel, this.props.partModel.with({ criteria }));
  }

  onCriteriaRemove(guid) {
    const criteria = this.props.partModel.criteria.delete(guid);
    this.props.onEdit(this.props.itemModel, this.props.partModel.with({ criteria }));
  }

  onCriteriaEdit(c) {
    const criteria = this.props.partModel.criteria.set(c.guid, c);
    this.props.onEdit(this.props.itemModel, this.props.partModel.with({ criteria }));
  }

  onConceptsEdit(concepts, item: contentTypes.QuestionItem, part: contentTypes.Part) {
    const { onEdit } = this.props;

    onEdit(item, part.with({ concepts }));
  }

  onHintsEdit(hints, item: contentTypes.QuestionItem, part: contentTypes.Part) {
    const { onEdit } = this.props;

    onEdit(item, part.with({ hints }));
  }

  onExplanationEdit(explanation, item: contentTypes.QuestionItem, part: contentTypes.Part) {
    const { onEdit } = this.props;

    onEdit(item, part.with({ explanation }));
  }

  renderQuestionTitle(): JSX.Element {
    const { model, onRemoveQuestion } = this.props;

    return (
      <ContentTitle
          title={getLabelForQuestion(model)}
          onRemove={onRemoveQuestion} />
    );
  }

  renderAdditionalOptions() {
    return [];
  }

  renderOptions() {
    const { hideGradingCriteria, editMode, grading, onGradingChange } = this.props;

    let options = [];

    // add grading criteria option if not disabled
    if (!hideGradingCriteria) {
      options = options.concat(
        <OptionControl key="grading" name="Grading">
          <Select
            editMode={editMode}
            label=""
            value={grading}
            onChange={onGradingChange}>
            <option value="automatic">Automatic</option>
            <option value="instructor">Instructor</option>
            <option value="hybrid">Hybrid</option>
          </Select>
        </OptionControl>,
      );
    }

    // add custom defined options
    const additionalOptions = this.renderAdditionalOptions();
    if (additionalOptions.length > 0) {
      options = options.concat(
        <div key="flex-spacer" className="flex-spacer"/>,
        ...additionalOptions,
      );
    }

    return options.length > 0
      ? (
        <div className="options">
          {options}
        </div>
      )
      : null;
  }

  renderQuestionSection() {
    const {
      editMode,
      services,
      context,
      body,
      onBodyEdit,
    } = this.props;

    const bodyStyle = {
      minHeight: '50px',
      borderStyle: 'none',
      borderWith: '1px',
      borderColor: '#AAAAAA',
    };

    return (
      <div className="question-body" key="question">
          <HtmlContentEditor
            ref={c => this.htmlEditor = c}
            editMode={editMode}
            services={services}
            context={context}
            editorStyles={bodyStyle}
            inlineToolbar={<InlineToolbar/>}
            inlineInsertionToolbar={<InlineInsertionToolbar/>}
            blockToolbar={<BlockToolbar/>}
            model={body}
            onEdit={onBodyEdit} />
      </div>
    );
  }

  renderDetailsTab() {
    return (
      <Tab className="details-tab">
        {this.renderDetails()}
      </Tab>
    );
  }

  renderSkillsTab(item: contentTypes.QuestionItem, part: contentTypes.Part): JSX.Element {
    return (
      <Tab className="skills-tab">
        <TabSection className="skills">
          <TabSectionHeader title="Attached Skills"/>
          <TabSectionContent>
            <ConceptsEditor
              editMode={this.props.editMode}
              services={this.props.services}
              context={this.props.context}
              model={part.concepts}
              onEdit={concepts => this.onConceptsEdit(concepts, item, part)} />
          </TabSectionContent>
        </TabSection>
      </Tab>
    );
  }

  renderGradingCriteriaTab(item: contentTypes.QuestionItem, part: contentTypes.Part): JSX.Element {
    const {
      context,
      services,
      editMode,
      partModel,
    } = this.props;

    return (
      <Tab className="grading-tab">
        <TabSection className="grading">
          <Button
            editMode={editMode}
            type="link"
            onClick={this.onCriteriaAdd}>
            Add Grading Criteria
          </Button>

          {partModel.criteria.toArray()
            .map(c => (
              <CriteriaEditor
                key={c.guid}
                onRemove={this.onCriteriaRemove}
                model={c}
                onEdit={this.onCriteriaEdit}
                context={context}
                services={services}
                editMode={editMode} />
            ))
          }
        </TabSection>
      </Tab>
    );
  }

  renderHintsTab(item: contentTypes.QuestionItem, part: contentTypes.Part): JSX.Element {
    return (
      <Tab className="hints-tab">
        <TabSection className="hints">
          <TabSectionHeader title="Hints"/>
          <TabSectionContent>
            <Hints
              context={this.props.context}
              services={this.props.services}
              editMode={this.props.editMode}
              model={part}
              onEdit={hints => this.onHintsEdit(hints, item, part)} />
          </TabSectionContent>
        </TabSection>
      </Tab>
    );
  }

  renderOtherTab(item: contentTypes.QuestionItem, part: contentTypes.Part): JSX.Element {
    const { context, services, editMode } = this.props;

    return (
      <Tab className="other-tab">
        <TabSection className="other">
          <TabSectionHeader title="Explanation"/>
          <TabSectionContent>
            <ExplanationEditor
              context={context}
              services={services}
              editMode={editMode}
              model={part.explanation}
              onEdit={explanation => this.onExplanationEdit(explanation, item, part)} />
          </TabSectionContent>
        </TabSection>
      </Tab>
    );
  }


  renderItemParts(): JSX.Element[] {
    const { model, hideGradingCriteria } = this.props;
    const items = model.items.toArray();
    const parts = model.parts.toArray();

    const showAdditionalTabs = this.renderAdditionalTabs() !== true
      && this.renderAdditionalTabs() !== false;

    return items.map((item, index) => (
      <div key={item.guid} className="item-part-editor">
        <TabContainer
          labels={[
            ...(this.renderDetails() ? ['Details'] : []),
            ...(this.renderSkillsTab(item, parts[index]) ? ['Skills'] : []),
            ...(this.renderHintsTab(item, parts[index]) ? ['Hints'] : []),
            ...(!hideGradingCriteria ? ['Criteria'] : []),
            ...(showAdditionalTabs
                && (this.renderAdditionalTabs() as TabElement[]).map(tab => tab.label)),
            ...(this.renderOtherTab(item, parts[index]) ? ['Other'] : []),
          ]}>

          {this.renderDetails() ? this.renderDetailsTab() : null}
          {this.renderSkillsTab(item, parts[index]) ?
            this.renderSkillsTab(item, parts[index]) : null}
          {this.renderHintsTab(item, parts[index]) ?
            this.renderHintsTab(item, parts[index]) : null}
          {!hideGradingCriteria ? this.renderGradingCriteriaTab(item, parts[index]) : null}
          {showAdditionalTabs && (this.renderAdditionalTabs() as TabElement[])
            .map(tab => tab.content)}
          {this.renderOtherTab(item, parts[index]) ?
            this.renderOtherTab(item, parts[index]) : null}
        </TabContainer>
      </div>
    ));
  }

  render() {
    const {
      model,
      onFocus,
      onBlur,
    } = this.props;

    return (
      <div
        className={`question ${this.getClassName() || ''}`}
        onFocus={() => onFocus(model.id)}
        onBlur={() => onBlur(model.id)}>

        {this.renderQuestionTitle()}
        {this.renderOptions()}
        {this.renderQuestionSection()}
        {this.renderItemParts()}
      </div>
    );
  }
}
