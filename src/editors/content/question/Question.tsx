import * as React from 'react';
import * as Immutable from 'immutable';
import * as contentTypes from 'data/contentTypes';
import {
  AbstractItemPartEditorProps,
} from '../common/AbstractItemPartEditor';
import { Select, Button } from '../common/controls';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';
import InlineInsertionToolbar from '../html/InlineInsertionToolbar';
import { HtmlToolbarButton } from '../html/TypedToolbar';
import { InsertInputRefCommand } from '../question/commands';
import { Dropdown, DropdownItem } from 'editors/content/common/Dropdown.tsx';
import { CommandProcessor } from '../common/command';
import { EditorState } from 'draft-js';
import { TabContainer } from 'editors/content/common/TabContainer';
import { Hints } from '../part/Hints';
import { ExplanationEditor } from '../part/ExplanationEditor';
import ConceptsEditor from '../concepts/ConceptsEditor';
import { CriteriaEditor } from '../question/CriteriaEditor';
import { Skill } from 'types/course';
import { convertStringToCSS } from 'utils//style';

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

export type Tab = {
  label: string,
  content: JSX.Element,
};

const getLabelForQuestion = (question: contentTypes.Question): string => {
  if (question.items.size === 0) {
    return 'Input Question';
  } else {

    // Look at first item and base label off of that
    const item = question.items.first();

    switch (item.contentType) {
      case 'MultipleChoice':
        if (item.select === 'single') {
          return 'Multiple Choice Question';
        } else {
          return 'Check All That Apply Question';
        }
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
  }
};

type SectionHeaderProps = {
  title: string,
};

export const SectionHeader: React.StatelessComponent<SectionHeaderProps> = ({
  title,
  children,
}) => (
  <div className={`section-header`}>
    <h3>{title}</h3>
    <div className="flex-spacer" />
    <div className="controls">
      {children}
    </div>
  </div>
);

type SectionContentProps = {};

export const SectionContent: React.StatelessComponent<SectionContentProps> = ({ children }) => (
  <div className={`section-content`}>{children}</div>
);

type SectionProps = {
  className?: string,
};

export const Section: React.StatelessComponent<SectionProps> = ({ className, children }) => (
  <div className={`section ${className}`}>{children}</div>
);

type OptionControlProps = {
  name: string,
  onClick?: (e, name: string) => void;
};

export const OptionControl: React.StatelessComponent<OptionControlProps>
  = ({ name, onClick, children }) => (
  <div
    className={`control clickable ${convertStringToCSS(name)}`}
    onClick={e => onClick && onClick(e, name)}>
    <div className="control-label">{name}</div>
    {children}
  </div>
);

export const SectionControl = OptionControl;

/**
 * The content editor for HtmlContent.
 */
export class Question<P extends QuestionProps<contentTypes.QuestionItem>, S extends QuestionState>
  extends React.Component<P, S> {
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

  setClassname(className) {
    this.className = className;
  }

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
    const { onRemoveQuestion } = this.props;

    return (
      <div className="question-title">
        <div className="title">{getLabelForQuestion(this.props.model)}</div>
        <div className="flex-spacer"/>
        <div
          className="action-btn action-btn-duplicate"
          onClick={() => { console.log(`onClick: duplicate - NOT IMPLEMENTED`); }}>
          <i className="fa fa-copy" />
        </div>
        <div
          className="action-btn action-btn-remove"
          onClick={onRemoveQuestion}>
          <i className="fa fa-trash-o" />
        </div>
      </div>
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
      minHeight: '30px',
      borderStyle: 'none',
      borderWith: '1px',
      borderColor: '#AAAAAA',
    };

    return (
      <Section className="question" key="question">
        <SectionHeader title="Question"/>
        <SectionContent>
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
        </SectionContent>
      </Section>
    );
  }

  renderAdditionalSections() {
    return [];
  }

  renderSections() {
    return (
      <div className="sections">
        {[
          this.renderQuestionSection(),
          ...this.renderAdditionalSections(),
        ]}
      </div>
    );
  }

  renderSkillsTab(item: contentTypes.QuestionItem, part: contentTypes.Part): JSX.Element {
    return (
      <div className="skills-tab tab-content">
        <Section className="skills">
          <SectionHeader title="Attached Skills"/>
          <SectionContent>
            <ConceptsEditor
              editMode={this.props.editMode}
              services={this.props.services}
              context={this.props.context}
              model={part.concepts}
              onEdit={concepts => this.onConceptsEdit(concepts, item, part)} />
          </SectionContent>
        </Section>
      </div>
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
      <div className="grading-tab tab-content">
        <Section className="grading">
          <Button
            editMode={editMode}
            type="link"
            onClick={this.onCriteriaAdd}>
            Add Grading Criteria
          </Button>

          {partModel.criteria.toArray()
            .map(c => (
              <CriteriaEditor
                onRemove={this.onCriteriaRemove}
                model={c}
                onEdit={this.onCriteriaEdit}
                context={context}
                services={services}
                editMode={editMode} />
            ))
          }
        </Section>
      </div>
    );
  }

  renderHintsTab(item: contentTypes.QuestionItem, part: contentTypes.Part): JSX.Element {
    return (
      <div className="hints-tab tab-content">
        <Section className="hints">
          <Hints
            context={this.props.context}
            services={this.props.services}
            editMode={this.props.editMode}
            model={part}
            onEdit={hints => this.onHintsEdit(hints, item, part)} />
        </Section>
      </div>
    );
  }

  renderOtherTab(item: contentTypes.QuestionItem, part: contentTypes.Part): JSX.Element {
    const { context, services, editMode } = this.props;

    return (
      <div className="other-tab tab-content">
        <Section className="other">
          <div className="section-header">
            <h3>Explanation</h3>
          </div>
          <div className="section-content">
            <ExplanationEditor
              context={context}
              services={services}
              editMode={editMode}
              model={part.explanation}
              onEdit={explanation => this.onExplanationEdit(explanation, item, part)} />
          </div>
        </Section>
      </div>
    );
  }

  renderItemParts(): JSX.Element[] {
    const { model, hideGradingCriteria } = this.props;
    const items = model.items.toArray();
    const parts = model.parts.toArray();

    return items.map((item, index) => (
      <div key={item.guid} className="item-part-editor">
        <TabContainer
          labels={[
            'Skills',
            'Hints',
            ...(!hideGradingCriteria ? ['Criteria'] : []),
            'Other',
          ]}>

          {this.renderSkillsTab(item, parts[index])}
          {this.renderHintsTab(item, parts[index])}
          {!hideGradingCriteria ? this.renderGradingCriteriaTab(item, parts[index]) : null}
          {this.renderOtherTab(item, parts[index])}
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
        className={`question ${this.className}`}
        onFocus={() => onFocus(model.id)}
        onBlur={() => onBlur(model.id)}>

        {this.renderQuestionTitle()}
        {this.renderOptions()}
        {this.renderSections()}
        {this.renderItemParts()}
      </div>
    );
  }
}
