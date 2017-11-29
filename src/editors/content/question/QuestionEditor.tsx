import * as React from 'react';
import * as Immutable from 'immutable';
import { ContentState, EditorState, ContentBlock, convertToRaw, SelectionState } from 'draft-js';
import * as contentTypes from '../../../data/contentTypes';
import { AuthoringActionsHandler, AuthoringActions,
  insertInlineEntity } from '../../../actions/authoring';
import { AppServices } from '../../common/AppServices';
import DraftWrapper from '../../content/common/draft/DraftWrapper';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import guid from '../../../utils/guid';

import { HtmlContentEditor } from '../html/HtmlContentEditor';
import { UnsupportedEditor } from '../unsupported/UnsupportedEditor';
import { MultipleChoice } from '../items/MultipleChoice';
import { Essay } from '../items/Essay';
import { CheckAllThatApply } from '../items/CheckAllThatApply';
import { ShortAnswer } from '../items/ShortAnswer';
import { Numeric } from '../items/Numeric';
import { Ordering } from '../items/Ordering';

import { Text } from '../items/Text';
import { FillInTheBlank } from '../items/FillInTheBlank';
import { CommandProcessor, Command } from '../common/command';
import { Collapse } from '../common/Collapse';
import { getHtmlDetails } from '../common/details';
import { EntityTypes } from '../../../data/content/html/common';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';
import InlineInsertionToolbar from '../html/InlineInsertionToolbar';

import { HtmlToolbarButton } from '../html/TypedToolbar';
import { Toolbar } from '../common/toolbar/Toolbar';
import { ToolbarButton } from '../common/toolbar/ToolbarButton';
import * as toolbarConfigs from '../common/toolbar/Configs';
import ConceptsEditor from '../concepts/ConceptsEditor';
import { TextInput, InlineForm, Select, Button, Checkbox } from '../common/controls';
import { changes, removeInputRef } from '../../../data/content/html/changes';
import { InsertInputRefCommand } from './commands';
import { RemovableContent } from '../common/RemovableContent';
import { DragHandle } from '../../document/assessment/DragHandle';

import './QuestionEditor.scss';

type Ids = {
  id: string,
};

export interface QuestionEditorProps extends AbstractContentEditorProps<contentTypes.Question> {
  onRemove: (guid: string) => void;
  isParentAssessmentGraded?: boolean;
}

export interface QuestionEditorState {

  activeItemId: string;
}

function getLabelForQuestion(question: contentTypes.Question) : string {

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

}

/**
 * The content editor for HtmlContent.
 */
export abstract class QuestionEditor
  extends AbstractContentEditor<contentTypes.Question, QuestionEditorProps, QuestionEditorState> {
  ids: Ids;
  lastBody: contentTypes.Html;
  itemToAdd: any;
  fillInTheBlankCommand: InsertInputRefCommand;
  numericCommand: InsertInputRefCommand;
  textCommand: InsertInputRefCommand;
  htmlEditor: CommandProcessor<EditorState>;

  constructor(props) {
    super(props);

    this.state = {
      activeItemId: null,
    };

    this.ids = {
      id: guid(),
    };

    const createFillInTheBlank = () => {
      const value = guid().replace('-', '');
      const choice = new contentTypes.Choice({ value, guid: guid() });

      const choices = Immutable.OrderedMap<string, contentTypes.Choice>().set(choice.guid, choice);

      return new contentTypes.FillInTheBlank().with({ choices });
    };

    this.onBodyEdit = this.onBodyEdit.bind(this);
    this.onItemPartEdit = this.onItemPartEdit.bind(this);
    this.onAddMultipleChoice = this.onAddMultipleChoice.bind(this);
    this.onAddOrdering = this.onAddOrdering.bind(this);
    this.onAddShortAnswer = this.onAddShortAnswer.bind(this);

    this.fillInTheBlankCommand
      = new InsertInputRefCommand(this, createFillInTheBlank, 'FillInTheBlank');
    this.numericCommand
      = new InsertInputRefCommand(this, () => new contentTypes.Numeric(), 'Numeric');
    this.textCommand = new InsertInputRefCommand(this, () => new contentTypes.Text(), 'Text');

    this.onRemove = this.onRemove.bind(this);
    this.onInsertFillInTheBlank = this.onInsertFillInTheBlank.bind(this);
    this.onInsertNumeric = this.onInsertNumeric.bind(this);
    this.onInsertText = this.onInsertText.bind(this);

    this.onFocusChange = this.onFocusChange.bind(this);
    this.onBlur = this.onBlur.bind(this);


    this.onGradingChange = this.onGradingChange.bind(this);
    this.lastBody = this.props.model.body;
  }

  onBlur(activeItemId: string) {
    if (this.state.activeItemId === activeItemId) {
      this.setState({ activeItemId: null });
    }
  }

  canInsertAnotherPart() : boolean {
    const restricted = this.props.isParentAssessmentGraded
      === undefined || this.props.isParentAssessmentGraded;

    return !restricted || this.props.model.items.size === 0;
  }

  onInsertNumeric(e) {
    e.preventDefault();
    if (this.canInsertAnotherPart()) {
      this.htmlEditor.process(this.numericCommand);
    }

  }
  onInsertText(e) {
    e.preventDefault();
    if (this.canInsertAnotherPart()) {
      this.htmlEditor.process(this.textCommand);
    }
  }
  onInsertFillInTheBlank(e) {
    e.preventDefault();
    if (this.canInsertAnotherPart()) {
      this.htmlEditor.process(this.fillInTheBlankCommand);
    }
  }


  onFocusChange(activeItemId: string) {
    this.setState({ activeItemId });
  }


  onBodyEdit(body) {

    let question = this.props.model.with({ body });

    if (this.lastBody !== undefined) {
      const delta
        = changes(EntityTypes.input_ref, '@input', this.lastBody.contentState, body.contentState);

      // For any deletions of input_refs, we need to make sure that we remove
      // the corresponding item and part from the question model
      if (delta.deletions.size > 0) {
        let items = this.props.model.items;
        let parts = this.props.model.parts;
        const itemArray = items.toArray();
        const partsArray = parts.toArray();
        delta.deletions.toArray().forEach((d) => {


          // Find the item whose id matches this entity @input data field
          // and remove it and the corresponding part
          for (let i = 0; i < itemArray.length; i += 1) {
            const currentItem = (itemArray[i] as any);

            if (currentItem.id !== undefined && currentItem.id === d.entity.data['@input']) {
              items = items.delete(currentItem.guid);
              parts = parts.delete(partsArray[i].guid);
              break;
            }
          }

        });
        question = question.with({ items, parts });

      } else if (delta.additions.size > 0) {

        const input = delta.additions.toArray()[0].entity.data['@input'];

        const item = this.itemToAdd.with({ guid: input, id: input });

        question = question.with({ items: question.items.set(item.guid, item) });

        let responses = Immutable.OrderedMap<string, contentTypes.Response>();
        if (item.contentType === 'FillInTheBlank') {

          const feedback = new contentTypes.Feedback();
          let response = new contentTypes.Response({ match: item.choices.first().value });

          response = response.with({ guid: guid(),
            feedback: response.feedback.set(feedback.guid, feedback) });
          responses = responses
            .set(response.guid, response);
        }

        let part = new contentTypes.Part();
        part = part.with({ guid: guid(), responses });
        question = question.with({ parts: question.parts.set(part.guid, part) });

      }
    }

    this.lastBody = body;

    this.props.onEdit(question);
  }

  onItemPartEdit(item, part) {
    let model = this.props.model.with({ items: this.props.model.items.set(item.guid, item) });
    model = model.with({ parts: model.parts.set(part.guid, part) });
    this.props.onEdit(model);
  }


  onAddMultipleChoice(select) {

    if (!this.canInsertAnotherPart()) return;

    let item = new contentTypes.MultipleChoice();

    const value = select === 'multiple' ? 'A' : guid().replace('-', '');
    const match = select === 'multiple' ? 'A' : value;

    const choice = new contentTypes.Choice({ value, guid: guid() });
    const feedback = new contentTypes.Feedback();
    let response = new contentTypes.Response({ match });
    response = response.with({ guid: guid(),
      feedback: response.feedback.set(feedback.guid, feedback) });

    const choices = Immutable.OrderedMap<string, contentTypes.Choice>().set(choice.guid, choice);
    const responses = Immutable.OrderedMap<string, contentTypes.Response>()
      .set(response.guid, response);

    item = item.with({ guid: guid(), select, choices });

    let model = this.props.model.with({ items: this.props.model.items.set(item.guid, item) });

    let part = new contentTypes.Part();
    part = part.with({ guid: guid(), responses });
    model = model.with({ parts: model.parts.set(part.guid, part) });

    this.props.onEdit(model);
  }

  onRemove(itemModel: contentTypes.QuestionItem, partModel) {

    const items = this.props.model.items.delete(itemModel.guid);
    const parts = this.props.model.parts.delete(partModel.guid);
    let body = this.props.model.body;

    switch (itemModel.contentType) {
      case 'Numeric':
      case 'Text':
      case 'FillInTheBlank':
        body = removeInputRef(body, itemModel.id);
    }

    const model = this.props.model.with({ items, parts, body });
    this.props.onEdit(model);
  }

  onGradingChange(grading) {

    this.props.onEdit(this.props.model.with({ grading }));
  }

  onAddShortAnswer(e) {
    e.preventDefault();

    if (!this.canInsertAnotherPart()) return;


    const item = new contentTypes.ShortAnswer();
    let model = this.props.model.with({ items: this.props.model.items.set(item.guid, item) });

    let part = new contentTypes.Part();
    const response = new contentTypes.Response({ match: '*', score: '1' });

    part = part.with({ responses: part.responses.set(response.guid, response) });
    model = model.with({ parts: model.parts.set(part.guid, part) });

    this.props.onEdit(model);
  }

  onAddOrdering(e) {
    e.preventDefault();
    if (!this.canInsertAnotherPart()) return;

    const value = 'A';

    const choice = new contentTypes.Choice().with({ value, guid: guid() });
    const choices = Immutable.OrderedMap<string, contentTypes.Choice>().set(choice.guid, choice);
    const item = new contentTypes.Ordering().with({ choices });
    let model = this.props.model.with({ items: this.props.model.items.set(item.guid, item) });

    const part = new contentTypes.Part();
    model = model.with({ parts: model.parts.set(part.guid, part) });

    this.props.onEdit(model);
  }

  renderItemPartEditor(item: contentTypes.QuestionItem, part: contentTypes.Part) {
    if (item.contentType === 'MultipleChoice' && item.select === 'single') {
      return <MultipleChoice
        context={this.props.context}
        services={this.props.services}
        editMode={this.props.editMode}
        onRemove={this.onRemove}
        onFocus={this.onFocusChange}
        onBlur={this.onBlur}
        key={item.guid}
        itemModel={item}
        partModel={part}
        hideGradingCriteria={!this.props.isParentAssessmentGraded}
        onEdit={(c, p) => this.onItemPartEdit(c, p)}
        />;
    } else if (item.contentType === 'MultipleChoice' && item.select === 'multiple') {
      return <CheckAllThatApply
        context={this.props.context}
        services={this.props.services}
        editMode={this.props.editMode}
        onRemove={this.onRemove}
        onFocus={this.onFocusChange}
        onBlur={this.onBlur}
        key={item.guid}
        itemModel={item}
        partModel={part}
        hideGradingCriteria={!this.props.isParentAssessmentGraded}
        onEdit={(c, p) => this.onItemPartEdit(c, p)}
        />;
    } else if (item.contentType === 'FillInTheBlank') {
      return <FillInTheBlank
          context={this.props.context}
          services={this.props.services}
          editMode={this.props.editMode}
          onRemove={this.onRemove}
          onFocus={this.onFocusChange}
          onBlur={this.onBlur}
          key={item.guid}
          itemModel={item}
          partModel={part}
          hideGradingCriteria={!this.props.isParentAssessmentGraded}
          onEdit={(c, p) => this.onItemPartEdit(c, p)}
          />;
    } else if (item.contentType === 'Numeric') {
      return <Numeric
          context={this.props.context}
          services={this.props.services}
          editMode={this.props.editMode}
          onRemove={this.onRemove}
          onFocus={this.onFocusChange}
          onBlur={this.onBlur}
          key={item.guid}
          itemModel={item}
          partModel={part}
          hideGradingCriteria={!this.props.isParentAssessmentGraded}
          onEdit={(c, p) => this.onItemPartEdit(c, p)}
          />;

    } else if (item.contentType === 'Text') {
      return <Text
          context={this.props.context}
          services={this.props.services}
          editMode={this.props.editMode}
          onRemove={this.onRemove}
          onFocus={this.onFocusChange}
          onBlur={this.onBlur}
          key={item.guid}
          itemModel={item}
          partModel={part}
          hideGradingCriteria={!this.props.isParentAssessmentGraded}
          onEdit={(c, p) => this.onItemPartEdit(c, p)}
          />;

    } else if (item.contentType === 'ShortAnswer') {
      return <ShortAnswer
          context={this.props.context}
          services={this.props.services}
          editMode={this.props.editMode}
          onRemove={this.onRemove}
          onFocus={this.onFocusChange}
          onBlur={this.onBlur}
          key={item.guid}
          itemModel={item}
          partModel={part}
          hideGradingCriteria={!this.props.isParentAssessmentGraded}
          onEdit={(c, p) => this.onItemPartEdit(c, p)}
          />;
    } else if (item.contentType === 'Ordering') {
      return <Ordering
          context={this.props.context}
          services={this.props.services}
          editMode={this.props.editMode}
          onRemove={this.onRemove}
          onFocus={this.onFocusChange}
          onBlur={this.onBlur}
          key={item.guid}
          itemModel={item}
          partModel={part}
          hideGradingCriteria={!this.props.isParentAssessmentGraded}
          onEdit={(c, p) => this.onItemPartEdit(c, p)}
          />;
    } else if (item.contentType === 'Essay') {
      return <Essay
          context={this.props.context}
          services={this.props.services}
          editMode={this.props.editMode}
          onRemove={this.onRemove}
          onFocus={this.onFocusChange}
          onBlur={this.onBlur}
          key={item.guid}
          itemModel={item}
          partModel={part}
          hideGradingCriteria={!this.props.isParentAssessmentGraded}
          onEdit={(c, p) => this.onItemPartEdit(c, p)}
          />;
    }
  }


  renderItemsAndParts() {

    const items = this.props.model.items.toArray();
    const parts = this.props.model.parts.toArray();
    const toRender = [];
    for (let i = 0; i < items.length; i += 1) {
      toRender.push(<div key={items[i].guid}>
        {this.renderItemPartEditor(items[i], parts[i])}</div>);
    }

    return toRender;
  }



  render() : JSX.Element {

    const isMultipart = this.props.model.items.size === 0
      || this.props.model.items.first().contentType === 'Text'
      || this.props.model.items.first().contentType === 'Numeric'
      || this.props.model.items.first().contentType === 'FillInTheBlank';

    const inlineToolbar
      = <InlineToolbar>

        </InlineToolbar>;

    const multipartButtons = isMultipart
      ? [<HtmlToolbarButton
        tooltip="Insert Dropdown" key="server"
        icon="server" command={this.fillInTheBlankCommand}/>,
        <HtmlToolbarButton
          tooltip="Insert Numeric Input" key="info"
          icon="info" command={this.numericCommand}/>,
        <HtmlToolbarButton
          tooltip="Insert Text Input" key="i-cursor"
          icon="i-cursor" command={this.textCommand}/>]
        : [];

    const insertionToolbar =
        <InlineInsertionToolbar>
          {multipartButtons}
        </InlineInsertionToolbar>;

    const blockToolbar = <BlockToolbar/>;

    const bodyStyle = {
      minHeight: '30px',
      borderStyle: 'none',
      borderWith: '1px',
      borderColor: '#AAAAAA',
    };

    const addPart =
      this.props.model.items.size === 0
       || this.props.model.items.first().contentType === 'Text'
       || this.props.model.items.first().contentType === 'Numeric'
       || this.props.model.items.first().contentType === 'FillInTheBlank'

       ? <div className="dropdown" style={ { display: 'inline' } }>
          <button disabled={!this.props.editMode}
            className="btn btn-secondary btn-link dropdown-toggle"
            type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Add Item
          </button>
          <div className="dropdown-menu">
            <a onClick={this.onInsertNumeric} className="dropdown-item">Numeric</a>
            <a onClick={this.onInsertText} className="dropdown-item">Text</a>
            <a onClick={this.onInsertFillInTheBlank}
              className="dropdown-item">Dropdown</a>
          </div>
        </div>
      : null;


    const expanded = (
      <form className="inline">
        {addPart}
        <Select editMode={this.props.editMode}
          label="Grading" value={this.props.model.grading}
          onChange={this.onGradingChange}>
          <option value="automatic">Automatic</option>
          <option value="instructor">Instructor</option>
          <option value="hybrid">Hybrid</option>
        </Select>
      </form>);

    return (

      <RemovableContent editMode={this.props.editMode}
        onRemove={this.props.onRemove.bind(this, this.props.model.guid)}
        title={getLabelForQuestion(this.props.model)}
        associatedClasses="question">

        <div style={ { position: 'relative' } }>

          {expanded}

          <HtmlContentEditor
                ref={c => this.htmlEditor = c}
                editMode={this.props.editMode}
                services={this.props.services}
                context={this.props.context}
                activeItemId={this.state.activeItemId}
                editorStyles={bodyStyle}
                inlineToolbar={inlineToolbar}
                inlineInsertionToolbar={insertionToolbar}
                blockToolbar={blockToolbar}
                model={this.props.model.body}
                onEdit={this.onBodyEdit}
                />

          {this.renderItemsAndParts()}

        </div>

      </RemovableContent>);
  }

}

