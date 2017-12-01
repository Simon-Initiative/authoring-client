import * as React from 'react';
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
import ConceptsEditor from '../concepts/ConceptsEditor.controller';
import { CriteriaEditor } from '../question/CriteriaEditor';

import './Question.scss';

export interface QuestionProps
  extends AbstractItemPartEditorProps<any> {
  onBodyEdit: (...args: any[]) => any;
  body: any;

  grading: any;
  onGradingChange: (value) => void;
  hideGradingCriteria: boolean;

  model: contentTypes.Question;
  onConceptsEdit: (concepts, item, part) => void;
  onHintsEdit: (item, part) => void;
  onExplanation: (explanation, item, part) => void;
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
    {children}
  </div>
);

type SectionContentProps = {};

export const SectionContent: React.StatelessComponent<SectionContentProps> = ({ children }) => (
  <div className={`section-content`}>{children}</div>
);

type SectionProps = {
  name: string,
};

export const Section: React.StatelessComponent<SectionProps> = ({ name, children }) => (
  <div key={name} className={`section ${name}`}>{children}</div>
);

/**
 * The content editor for HtmlContent.
 */
export class Question<P extends QuestionProps, S extends QuestionState>
  extends React.PureComponent<P, S> {
  htmlEditor: CommandProcessor<EditorState>;
  className: string;

  constructor(props) {
    super(props);
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

  renderQuestionTitle(): JSX.Element {
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
          onClick={() => { console.log(`onClick: remove - NOT IMPLEMENTED`); }}>
          <i className="fa fa-trash-o" />
        </div>
      </div>
    );
  }

  renderCustomOptions() {
    return [];
  }

  renderOptions() {
    const { hideGradingCriteria, editMode, grading, onGradingChange } = this.props;

    let options = [];

    // add grading criteria option if not disabled
    if (!hideGradingCriteria) {
      options = options.concat(
        <div className="control grading">
          <div className="control-label">Grading</div>
          <Select
            editMode={editMode}
            label=""
            value={grading}
            onChange={onGradingChange}>
            <option value="automatic">Automatic</option>
            <option value="instructor">Instructor</option>
            <option value="hybrid">Hybrid</option>
          </Select>
        </div>,
      );
    }

    // add custom defined options
    options = options.concat(this.renderCustomOptions());

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
      <Section name="question">
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
    const { onConceptsEdit } = this.props;

    return (
      <div className="skills-tab tab-content">
        <div className="section">
          <ConceptsEditor
            editMode={this.props.editMode}
            services={this.props.services}
            context={this.props.context}
            courseId={this.props.context.courseId}
            model={part.concepts}
            onEdit={concepts => onConceptsEdit(concepts, item, part)}
            title="Skills"
            conceptType="skill" />
        </div>
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
        <div className="section">
          <Button
            editMode={editMode}
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
        </div>
      </div>
    );
  }

  renderHintsTab(item: contentTypes.QuestionItem, part: contentTypes.Part): JSX.Element {
    const { onHintsEdit } = this.props;

    return (
      <div className="hints-tab tab-content">
        <div className="section">
          <Hints
            context={this.props.context}
            services={this.props.services}
            editMode={this.props.editMode}
            model={part}
            onEdit={() => onHintsEdit(item, part)} />
        </div>
      </div>
    );
  }

  renderOtherTab(item: contentTypes.QuestionItem, part: contentTypes.Part): JSX.Element {
    const { context, services, editMode, onExplanation } = this.props;

    return (
      <div className="other-tab tab-content">
        <div className="section">
          <div className="section-header">
            <h3>Explanation</h3>
          </div>
          <div className="section-content">
            <ExplanationEditor
              context={context}
              services={services}
              editMode={editMode}
              model={part.explanation}
              onEdit={explanation => onExplanation(explanation, item, part)} />
          </div>
        </div>
      </div>
    );
  }

  renderItemParts(): JSX.Element[] {
    const { model } = this.props;
    const items = model.items.toArray();
    const parts = model.parts.toArray();

    return items.map((item, index) => (
      <div key={item.guid} className="item-part-editor">
        <TabContainer
          labels={[
            'Skills',
            'Hints',
            'Grading Criteria',
            'Other',
          ]}>

          {this.renderSkillsTab(item, parts[index])}
          {this.renderHintsTab(item, parts[index])}
          {this.renderGradingCriteriaTab(item, parts[index])}
          {this.renderOtherTab(item, parts[index])}
          {}
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
