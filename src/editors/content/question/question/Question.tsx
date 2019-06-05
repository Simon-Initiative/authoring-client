import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import * as contentTypes from 'data/contentTypes';
import { AbstractItemPartEditorProps } from 'editors/content/common/AbstractItemPartEditor';
import { Button, Select } from 'editors/content/common/controls';
import {
  TabContainer, Tab, TabElement, TabSection, TabSectionHeader, TabSectionContent, TabOptionControl,
} from 'components/common/TabContainer';
import { Hints } from 'editors/content/part/Hints';
import SkillsEditor from 'editors/content/skills/SkillsEditor';
import { CriteriaEditor } from 'editors/content/question/question/CriteriaEditor';
import { Skill } from 'types/course';
import { ContentTitle } from 'editors/content/common/ContentTitle';
import guid from 'utils/guid';
import { ContentContainer } from 'editors/content/container/ContentContainer';
import { containsDynaDropCustom } from 'editors/content/utils/common';
import { Badge } from 'editors/content/common/Badge';
import { VariablesEditor } from
  'editors/content/question/variables/firstgeneration/VariablesEditor';
import './Question.scss';
import { HelpPopover } from 'editors/common/popover/HelpPopover.controller';
import { ModuleEditor } from
  'editors/content/question/variables/secondgeneration/ModuleEditor.controller';
import { MODULE_IDENTIFIER } from 'data/content/assessment/variable';
import { modalActions } from 'actions/modal';
import ModalSelection, { sizes } from 'utils/selection/ModalSelection';
import { Remove } from 'components/common/Remove';
import { handleKey, unhandleKey } from 'editors/document/common/keyhandlers';
import { PartAnalytics } from 'editors/document/analytics/PartAnalytics';
import { AnalyticsState } from 'reducers/analytics';
import { DatasetStatus } from 'types/analytics/dataset';

export const REMOVE_QUESTION_DISABLED_MSG =
  'An assessment must contain at least one question or pool. '
  + 'Please add another question or pool before removing this one';

export interface OwnQuestionProps<ModelType>
  extends AbstractItemPartEditorProps<ModelType> {
  body: any;
  grading: any;
  hideGradingCriteria: boolean;
  hideVariables: boolean;
  allSkills: Immutable.OrderedMap<string, Skill>;
  model: contentTypes.Question;
  canRemoveQuestion: boolean;
  activeContentGuid: string;
  hover: string;
  branchingQuestions: Maybe<number[]>;
  onBodyEdit: (...args: any[]) => any;
  onFocus: (child, model, textSelection) => void;
  onItemFocus: (itemId: string) => void;
  onGradingChange: (value) => void;
  onVariablesChange: (vars: Immutable.OrderedMap<string, contentTypes.Variable>) => void;
  onRemoveQuestion: () => void;
  onDuplicate: () => void;
  onUpdateHover: (hover: string) => void;
}

export interface QuestionProps<ModelType>
  extends OwnQuestionProps<ModelType> {
  analytics: AnalyticsState;
  assessmentId: string;
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
    case 'ImageHotspot':
      return 'Image Hotspot';
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
    this.onEnableVariables = this.onEnableVariables.bind(this);
    this.onDisableVariables = this.onDisableVariables.bind(this);
    this.onSwitchToOldVariableEditor = this.onSwitchToOldVariableEditor.bind(this);
  }

  componentDidMount() {
    // Hotkey for Georgia State to enable the first generation variable editor.
    handleKey(
      '⌘+shift+0, ctrl+shift+0',
      () => true,
      this.onSwitchToOldVariableEditor);
  }

  componentWillUnmount() {
    unhandleKey('⌘+shift+0, ctrl+shift+0');
  }

  isNewVariableEditorActive() {
    const { model } = this.props;
    return model.variables.size === 1 && model.variables.first().name === MODULE_IDENTIFIER;
  }

  onSwitchToOldVariableEditor() {
    const { editMode, onVariablesChange, services } = this.props;

    if (!this.isNewVariableEditorActive()) {
      return;
    }

    const resetVariablesAndDismiss = () => {
      const name = 'V1';
      const expression = 'const x = 1';

      const variable = new contentTypes.Variable().with({
        name,
        expression,
      });
      onVariablesChange(Immutable.OrderedMap<string, contentTypes.Variable>(
        [[variable.guid, variable]]));
      services.dismissModal();
    };

    const modal = <ModalSelection
      title="Use old dynamic question editor?"
      onCancel={modalActions.dismiss}
      onInsert={resetVariablesAndDismiss}
      okClassName="danger"
      okLabel="Use old editor"
      disableInsert={!editMode}
      size={sizes.medium}>
      Are you sure you want to remove all of your variables and switch to the old
       dynamic question editor?
    </ModalSelection>;

    services.displayModal(modal);
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

  onCriteriaRemove(guid: string) {
    const criteria = this.props.partModel.criteria.delete(guid);
    this.props.onEdit(this.props.itemModel, this.props.partModel.with({ criteria }), null);
  }

  onCriteriaEdit(c: contentTypes.GradingCriteria) {
    const criteria = this.props.partModel.criteria.set(c.guid, c);
    this.props.onEdit(this.props.itemModel, this.props.partModel.with({ criteria }), c);
  }

  onSkillsEdit(
    skills: Immutable.Set<string>, item: contentTypes.QuestionItem, part: contentTypes.Part) {
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
        editMode={editMode}
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

  onEnableVariables() {
    const { onVariablesChange } = this.props;

    const name = MODULE_IDENTIFIER;

    const variable = new contentTypes.Variable().with({
      name,
    });

    onVariablesChange(Immutable.OrderedMap<string, contentTypes.Variable>(
      [[variable.guid, variable]]));
  }

  onDisableVariables() {
    const { editMode, onVariablesChange, services } = this.props;

    const deleteAndDismiss = () => {
      onVariablesChange(Immutable.OrderedMap<string, contentTypes.Variable>());
      services.dismissModal();
    };

    const modal = <ModalSelection
      title="Remove all variables?"
      onCancel={modalActions.dismiss}
      onInsert={deleteAndDismiss}
      okClassName="danger"
      okLabel="Remove Variables"
      disableInsert={!editMode}
      size={sizes.small}>
      Are you sure you want to remove all variables from this question?
    </ModalSelection>;

    services.displayModal(modal);
  }

  renderVariables() {

    const { hideVariables, onFocus, model, editMode, services, context, onVariablesChange,
      onUpdateHover, hover, activeContentGuid } = this.props;

    if (hideVariables) {
      return null;
    }

    const enableVariablesButton =
      <button className="btn btn-sm btn-outline-primary" type="button"
        disabled={!editMode}
        onClick={() => this.onEnableVariables()}>
        Create Variables
      </button>;

    const variableProps = {
      activeContentGuid,
      hover,
      onUpdateHover,
      onFocus,
      editMode,
      services,
      context,
      model: model.variables,
      onEdit: onVariablesChange,
    };

    const helpPopup =
      <div className="variableHeader">
        Variables

        <HelpPopover activateOnClick>
          <div>
            <p>Use <b>JavaScript</b> to create <b>dynamic</b> questions.
            A dynamic question allows you to vary parts of the question.</p>

            <p>Once you have defined your variables, use them in your
              question by typing the variable name surrounded by &quot;@@&quot;</p>

            <p>For example, a question using two variables:</p>

            <blockquote>
              <code>
                What is the value @@V1@@ divided by @@V2@@ equal to?
              </code>
            </blockquote>

          </div>
        </HelpPopover>
      </div>;

    if (model.variables.size === 0) {
      return (
        <div className="variable-wrapper">
          {helpPopup}
          {enableVariablesButton}
        </div>
      );
    }

    return (
      <div className="variable-wrapper">
        {helpPopup} <Remove editMode={editMode} onRemove={this.onDisableVariables} />
        {/* Decide whether to show the new or old variable UI. The new UI (VariableModuleEditor)
        creates a single variable with the name of the constant MODULE_IDENTIFIER */}
        {this.isNewVariableEditorActive()
          ? <ModuleEditor {...variableProps}
            onSwitchToOldVariableEditor={this.onSwitchToOldVariableEditor} />
          : <VariablesEditor {...variableProps} />}
      </div>
    );
  }

  renderOptions() {
    const { hideGradingCriteria,
      editMode, grading, onGradingChange } = this.props;

    let options = [];

    // add grading criteria option if not disabled
    if (!hideGradingCriteria) {
      options = options.concat(
        <OptionControl key="grading" name="Grading" label="Grading">
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

  renderAnalytics() {
    const { model, assessmentId, analytics } = this.props;

    const part = model.parts.first();

    // return (
    //   <React.Fragment>
    //     <TabSection key="choices" className="choices">
    //       <TabSectionHeader title="Analytics"/>
    //       <TabSectionContent>
    //         {analytics.dataSet.caseOf({
    //           just: analyticsDataSet => analyticsDataSet.byResourcePart.caseOf({
    //             just: byResourcePart => Maybe.maybe(
    //               analyticsDataSet.status === DatasetStatus.DONE
    //               && byResourcePart.getIn([assessmentId, part.id]),
    //             ).caseOf({
    //               just: partAnalytics => <PartAnalytics partAnalytics={partAnalytics} />,
    //               nothing: () => null,
    //             }),
    //             nothing: () => null,
    //           }),
    //           nothing: () => null,
    //         })}
    //       </TabSectionContent>
    //     </TabSection>
    //   </React.Fragment>
    // );

    return analytics.dataSet.caseOf({
      just: analyticsDataSet => analyticsDataSet.byResourcePart.caseOf({
        just: byResourcePart => Maybe.maybe(
          analyticsDataSet.status === DatasetStatus.DONE
          && byResourcePart.getIn([assessmentId, part.id]),
        ).caseOf({
          just: partAnalytics => <PartAnalytics partAnalytics={partAnalytics} />,
          nothing: () => null,
        }),
        nothing: () => null,
      }),
      nothing: () => null,
    });
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
            <TabOptionControl name="add-cirteria">
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
            <TabOptionControl name="add-hint">
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

    const renderSkillsLabel = (part: contentTypes.Part) => (
      <span>Skills <Badge color={part.skills.size > 0 ? '#2ecc71' : '#e74c3c'}>
        {part.skills.size}
      </Badge>
      </span>
    );

    return items.map((item, index) => (
      <div key={item.guid} className="item-part-editor">
        <TabContainer
          labels={[
            ...(this.renderDetails() ? ['Details'] : []),
            ...(this.renderSkillsTab(item, parts[index]) ? [renderSkillsLabel(parts[index])] : []),
            ...(this.renderHintsTab(item, parts[index]) ? ['Hints'] : []),
            ...(!hideGradingCriteria ? ['Criteria'] : []),
            ...(showAdditionalTabs
              && (this.renderAdditionalTabs() as TabElement[]).map(tab => tab.label)),
          ]}
          controls={[
            this.renderAnalytics(),
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
        {this.renderVariables()}
        {this.renderItemParts()}
      </div>
    );
  }
}
