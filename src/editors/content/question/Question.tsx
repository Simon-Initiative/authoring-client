import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import { AbstractItemPartEditorProps } from '../common/AbstractItemPartEditor';
import { Button, Select } from '../common/controls';
import {
  TabContainer, Tab, TabElement, TabSection, TabSectionHeader, TabSectionContent, TabOptionControl,
} from 'editors/content/common/TabContainer';
import { Hints } from '../part/Hints';
import SkillsEditor from '../skills/SkillsEditor';
import { CriteriaEditor } from '../question/CriteriaEditor';
import { Skill } from 'types/course';
import { ContentTitle } from 'editors/content/common/ContentTitle';
import guid from 'utils/guid';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { containsDynaDropCustom } from 'editors/content/question/QuestionEditor';

import './Question.scss';
import { HelpPopover } from 'editors/common/popover/HelpPopover.controller';

const REMOVE_QUESTION_DISABLED_MSG =
  'An assessment must contain at least one question. '
  + 'Please add another question before removing';

export interface QuestionProps<ModelType>
  extends AbstractItemPartEditorProps<ModelType> {
  onBodyEdit: (...args: any[]) => any;
  onFocus: (child, model, textSelection) => void;
  onItemFocus: (itemId: string) => void;
  body: any;
  grading: any;
  onGradingChange: (value) => void;
  hideGradingCriteria: boolean;
  allSkills: Immutable.OrderedMap<string, Skill>;
  model: contentTypes.Question;
  canRemoveQuestion: boolean;
  onRemoveQuestion: () => void;
  onDuplicate: () => void;
  activeContentGuid: string;
  hover: string;
  onUpdateHover: (hover: string) => void;
}

export interface QuestionState {

}

export const getLabelForQuestion = (question: contentTypes.Question): string => {
  if (containsDynaDropCustom(question.body)) {
    return 'Drag and Drop';
  }

  if (question.items.size === 0) {
    return 'Input';
  }

  // Look at first item and base label off of that
  const item = question.items.first();

  switch (item.contentType) {
    case 'MultipleChoice':
      if (item.select === 'single') {
        return 'Multiple Choice';
      }

      return 'Check All That Apply';
    case 'Ordering':
      return 'Ordering';
    case 'Essay':
      return 'Essay';
    case 'ShortAnswer':
      return 'Short Answer';
    case 'Text':
    case 'Numeric':
    case 'FillInTheBlank':
      return 'Input';
    default:
      return 'Question';
  }
};

export const OptionControl = TabOptionControl;

/**
 * Question Component
 */
export abstract class Question<P extends QuestionProps<contentTypes.QuestionItem>,
  S extends QuestionState> extends React.PureComponent<P, S> {


  className: string;

  constructor(props) {
    super(props);

    this.onAddHint = this.onAddHint.bind(this);
    this.onCriteriaAdd = this.onCriteriaAdd.bind(this);
    this.onCriteriaRemove = this.onCriteriaRemove.bind(this);
    this.onCriteriaEdit = this.onCriteriaEdit.bind(this);
    this.onSkillsEdit = this.onSkillsEdit.bind(this);
    this.onHintsEdit = this.onHintsEdit.bind(this);
  }

  abstract renderDetails(): JSX.Element | boolean;
  abstract renderAdditionalTabs(): TabElement[] | boolean;
  abstract getClassName(): string;

  onAddHint(item: contentTypes.QuestionItem, part: contentTypes.Part) {
    const hint = contentTypes.Hint.fromText('', guid());
    const updated = part.with({ hints: part.hints.set(hint.guid, hint) });
    this.onHintsEdit(item, updated, hint);
  }

  onCriteriaAdd() {
    const c = contentTypes.GradingCriteria.fromText('', guid());
    const criteria = this.props.partModel.criteria.set(c.guid, c);
    this.props.onEdit(this.props.itemModel, this.props.partModel.with({ criteria }), c);
  }

  onCriteriaRemove(guid) {
    const criteria = this.props.partModel.criteria.delete(guid);
    this.props.onEdit(this.props.itemModel, this.props.partModel.with({ criteria }), null);
  }

  onCriteriaEdit(c) {
    const criteria = this.props.partModel.criteria.set(c.guid, c);
    this.props.onEdit(this.props.itemModel, this.props.partModel.with({ criteria }), c);
  }

  onSkillsEdit(skills, item: contentTypes.QuestionItem, part: contentTypes.Part) {
    const { onEdit } = this.props;

    onEdit(item, part.with({ skills }), skills);
  }

  onHintsEdit(item: contentTypes.QuestionItem, part: contentTypes.Part, src) {
    const { onEdit } = this.props;

    onEdit(item, part, src);
  }

  renderQuestionTitle(): JSX.Element {
    const { model, canRemoveQuestion, onRemoveQuestion, editMode } = this.props;

    const checkAllHelpPopover = <HelpPopover activateOnClick>
      <iframe src="https://www.youtube.com/embed/-9Pd4B6Yy2M" height={500} width={'100%'} />
    </HelpPopover>;

    return (
      <ContentTitle
        title={getLabelForQuestion(model)}
        onDuplicate={editMode ? this.props.onDuplicate : undefined}
        canRemove={canRemoveQuestion}
        removeDisabledMessage={REMOVE_QUESTION_DISABLED_MSG}
        onRemove={onRemoveQuestion}
        helpPopover={getLabelForQuestion(model) === 'Check All That Apply'
          ? checkAllHelpPopover
          : null} />
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
        <div key="flex-spacer" className="flex-spacer" />,
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

    return (
      <div className="question-body" key="question">
        <ContentContainer
          activeContentGuid={this.props.activeContentGuid}
          hover={this.props.hover}
          onUpdateHover={this.props.onUpdateHover}
          onFocus={this.props.onFocus}
          editMode={editMode}
          services={services}
          context={context}
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
          <TabSectionHeader title="Attached Skills" />
          <TabSectionContent>
            <SkillsEditor
              activeContentGuid={null}
              hover={null}
              onUpdateHover={() => { }}
              editMode={this.props.editMode}
              services={this.props.services}
              context={this.props.context}
              onFocus={this.props.onFocus}
              model={part.skills}
              onEdit={skills => this.onSkillsEdit(skills, item, part)} />
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
      <Tab className="criteria-tab">
        <TabSection className="criteria">
          <TabSectionHeader title="Grading Criteria">
            <TabOptionControl key="add-cirteria" name="Add Criteria" hideLabel>
              <Button
                editMode={editMode}
                type="link"
                onClick={this.onCriteriaAdd}>
                Add Criteria
              </Button>
            </TabOptionControl>
          </TabSectionHeader>

          {partModel.criteria.toArray()
            .map(c => (
              <CriteriaEditor
                activeContentGuid={null}
                hover={null}
                onUpdateHover={() => { }}
                onFocus={this.props.onItemFocus.bind(this, c, this)}
                parent={null}
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
          <TabSectionHeader title="Hints">
            <TabOptionControl key="add-hint" name="Add Hint" hideLabel>
              <Button
                editMode={this.props.editMode}
                type="link"
                onClick={() => this.onAddHint(item, part)}>
                Add Hint
              </Button>
            </TabOptionControl>
          </TabSectionHeader>
          <TabSectionContent>
            <Hints
              {...this.props}
              model={part}
              onEdit={(part, h) => this.onHintsEdit(item, part, h)} />
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
          ]}>

          {this.renderDetails() ? this.renderDetailsTab() : null}
          {this.renderSkillsTab(item, parts[index]) ?
            this.renderSkillsTab(item, parts[index]) : null}
          {this.renderHintsTab(item, parts[index]) ?
            this.renderHintsTab(item, parts[index]) : null}
          {!hideGradingCriteria ? this.renderGradingCriteriaTab(item, parts[index]) : null}
          {showAdditionalTabs && (this.renderAdditionalTabs() as TabElement[])
            .map(tab => tab.content)}
        </TabContainer>
      </div>
    ));
  }

  render() {
    const {
      model,
      onBlur,
      onItemFocus,
    } = this.props;

    return (
      <div
        className={`question ${this.getClassName() || ''}`}
        onFocus={() => {
          onItemFocus(model.id);
        }}
        onBlur={() => onBlur(model.id)}>

        {this.renderQuestionTitle()}
        {this.renderOptions()}
        {this.renderQuestionSection()}
        {this.renderItemParts()}
      </div>
    );
  }
}
