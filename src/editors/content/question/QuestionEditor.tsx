'use strict'

import * as React from 'react';
import * as Immutable from 'immutable';
import { ContentState, EditorState, ContentBlock, convertToRaw, SelectionState } from 'draft-js';
import * as contentTypes from '../../../data/contentTypes';
import { AuthoringActionsHandler, AuthoringActions, insertInlineEntity } from '../../../actions/authoring';
import { AppServices } from '../../common/AppServices';
import DraftWrapper from '../../content/common/draft/DraftWrapper';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import guid from '../../../utils/guid';
import '../common/editor.scss';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import { UnsupportedEditor } from '../unsupported/UnsupportedEditor';
import { MultipleChoice } from '../items/MultipleChoice';
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
import { HtmlToolbarButton } from '../html/TypedToolbar';
import { Toolbar } from '../common/toolbar/Toolbar';
import { ToolbarButton } from '../common/toolbar/ToolbarButton';
import * as toolbarConfigs from '../common/toolbar/Configs';
import { ConceptsEditor } from '../concepts/ConceptsEditor';
import { TextInput, InlineForm, Button, Checkbox } from '../common/controls';
import { changes, removeInputRef } from '../../../data/content/html/changes';
import { InsertInputRefCommand } from './commands';

type Ids = {
  id: string
}

export interface QuestionEditor {
  ids: Ids;
  lastBody: contentTypes.Html
  itemToAdd: any;
  fillInTheBlankCommand: InsertInputRefCommand;
  numericCommand: InsertInputRefCommand;
  textCommand: InsertInputRefCommand;
  htmlEditor: CommandProcessor<EditorState>;
}

export interface QuestionEditorProps extends AbstractContentEditorProps<contentTypes.Question> {

}

export interface QuestionEditorState {

  activeItemId: string;
}

/**
 * The content editor for HtmlContent.
 */
export abstract class QuestionEditor 
  extends AbstractContentEditor<contentTypes.Question, QuestionEditorProps, QuestionEditorState> {
    
  constructor(props) {
    super(props);

    this.state = {
      activeItemId: null
    };

    this.ids = {
      id: guid()
    }

    this.onBodyEdit = this.onBodyEdit.bind(this);
    this.onItemPartEdit = this.onItemPartEdit.bind(this);
    this.onAddMultipleChoice = this.onAddMultipleChoice.bind(this);
    this.onAddOrdering = this.onAddOrdering.bind(this);
    this.onAddShortAnswer = this.onAddShortAnswer.bind(this);
    this.onConceptsEdit = this.onConceptsEdit.bind(this);
    this.fillInTheBlankCommand = new InsertInputRefCommand(this, () => new contentTypes.FillInTheBlank(), 'FillInTheBlank');
    this.numericCommand = new InsertInputRefCommand(this, () => new contentTypes.Numeric(), 'Numeric');
    this.textCommand = new InsertInputRefCommand(this, () => new contentTypes.Text(), 'Text');
    
    this.onRemove = this.onRemove.bind(this);
    this.onInsertFillInTheBlank = this.onInsertFillInTheBlank.bind(this);
    this.onInsertNumeric = this.onInsertNumeric.bind(this);
    this.onInsertText = this.onInsertText.bind(this);
    
    this.onFocusChange = this.onFocusChange.bind(this);
    this.onBlur = this.onBlur.bind(this);

    this.lastBody = this.props.model.body;
  }

  onBlur(activeItemId: string) {
    if (this.state.activeItemId === activeItemId) {
      this.setState({ activeItemId: null });
    }
  }

  onInsertNumeric() {
    this.htmlEditor.process(this.numericCommand);
  }
  onInsertText() {
    this.htmlEditor.process(this.textCommand);
  }
  onInsertFillInTheBlank() {
    this.htmlEditor.process(this.fillInTheBlankCommand);
  }

  onConceptsEdit(concepts) {
    this.props.onEdit(this.props.model.with({concepts}));
  }

  onFocusChange(activeItemId: string) {
    this.setState({ activeItemId });
  }

  onBodyEdit(body) {

    let question = this.props.model.with({body});

    if (this.lastBody !== undefined) {
      const delta = changes(EntityTypes.input_ref, '@input', this.lastBody.contentState, body.contentState);
    
      // For any deletions of input_refs, we need to make sure that we remove
      // the corresponding item and part from the question model
      if (delta.deletions.size > 0) {
        let items = this.props.model.items;
        let parts = this.props.model.parts;
        let itemArray = items.toArray();
        let partsArray = parts.toArray();
        delta.deletions.toArray().forEach(d => {
          
          
          // Find the item whose id matches this entity @input data field
          // and remove it and the corresponding part
          for (let i = 0; i < itemArray.length; i++) {
            let currentItem = (itemArray[i] as any);

            if (currentItem.id !== undefined && currentItem.id === d.entity.data['@input']) {
              items = items.delete(currentItem.guid);
              parts = parts.delete(partsArray[i].guid);
              break;
            }
          }

        });
        question = question.with({ items, parts});

      } else if (delta.additions.size > 0) {

        const input = delta.additions.toArray()[0].entity.data['@input'];

        const item = this.itemToAdd.with({guid: input, id: input});

        question = question.with({items: question.items.set(item.guid, item) });

        let part = new contentTypes.Part();
        part = part.with({guid: guid()});
        question = question.with({parts: question.parts.set(part.guid, part) });

      }
    }
    
    this.lastBody = body;
    
    this.props.onEdit(question);
  }

  onItemPartEdit(item, part) {
    let model = this.props.model.with({items: this.props.model.items.set(item.guid, item) });
    model = model.with({parts: model.parts.set(part.guid, part)});
    this.props.onEdit(model);
  }


  onAddMultipleChoice(select) {
    let item = new contentTypes.MultipleChoice();
    item = item.with({guid: guid(), select});

    let model = this.props.model.with({items: this.props.model.items.set(item.guid, item) });

    let part = new contentTypes.Part();
    part = part.with({guid: guid()});
    model = model.with({parts: model.parts.set(part.guid, part) });

    this.props.onEdit(model);
  }

  onRemove(itemModel: contentTypes.Item, partModel) {
    
    const items = this.props.model.items.delete(itemModel.guid);
    const parts = this.props.model.parts.delete(partModel.guid);
    let body = this.props.model.body;

    switch (itemModel.contentType) {
      case 'Numeric':
      case 'Text':
      case 'FillInTheBlank':
        body = removeInputRef(body, itemModel.id);
    }
    
    const model = this.props.model.with({items, parts, body});
    this.props.onEdit(model);
  }

  onAddShortAnswer() {
    let item = new contentTypes.ShortAnswer();
    let model = this.props.model.with({items: this.props.model.items.set(item.guid, item) });

    let part = new contentTypes.Part();
    let response = new contentTypes.Response({ match: '*', score: '1'});

    part = part.with({responses: part.responses.set(response.guid, response)});
    model = model.with({parts: model.parts.set(part.guid, part) });

    this.props.onEdit(model);
  }

  onAddOrdering() {
    let item = new contentTypes.Ordering();
    let model = this.props.model.with({items: this.props.model.items.set(item.guid, item) });

    let part = new contentTypes.Part();
    model = model.with({parts: model.parts.set(part.guid, part) });

    this.props.onEdit(model);
  }

  renderItemPartEditor(item: contentTypes.Item, part: contentTypes.Part) {
    if (item.contentType === 'MultipleChoice' && item.select === 'single') {
        return <MultipleChoice
          {...this.props}
          onRemove={this.onRemove}
          onFocus={this.onFocusChange}
          onBlur={this.onBlur}
          key={item.guid}
          itemModel={item}
          partModel={part}
          onEdit={(c, p) => this.onItemPartEdit(c, p)} 
          />
    } else if (item.contentType === 'MultipleChoice' && item.select === 'multiple') {
        return <CheckAllThatApply
          {...this.props}
          onRemove={this.onRemove}
          onFocus={this.onFocusChange}
          onBlur={this.onBlur}
          key={item.guid}
          itemModel={item}
          partModel={part}
          onEdit={(c, p) => this.onItemPartEdit(c, p)} 
          />
    } else if (item.contentType === 'FillInTheBlank') {
        return <FillInTheBlank
            {...this.props}
            onRemove={this.onRemove}
            onFocus={this.onFocusChange}
            onBlur={this.onBlur}
            key={item.guid}
            itemModel={item}
            partModel={part}
            onEdit={(c, p) => this.onItemPartEdit(c, p)} 
            />
    } else if (item.contentType === 'Numeric') {
        return <Numeric
            {...this.props}
            onRemove={this.onRemove}
            onFocus={this.onFocusChange}
            onBlur={this.onBlur}
            key={item.guid}
            itemModel={item}
            partModel={part}
            onEdit={(c, p) => this.onItemPartEdit(c, p)} 
            />
        
    } else if (item.contentType === 'Text') {
        return <Text
            {...this.props}
            onRemove={this.onRemove}
            onFocus={this.onFocusChange}
            onBlur={this.onBlur}
            key={item.guid}
            itemModel={item}
            partModel={part}
            onEdit={(c, p) => this.onItemPartEdit(c, p)} 
            />
        
    } else if (item.contentType === 'ShortAnswer') {
        return <ShortAnswer
            {...this.props}
            onRemove={this.onRemove}
            onFocus={this.onFocusChange}
            onBlur={this.onBlur}
            key={item.guid}
            itemModel={item}
            partModel={part}
            onEdit={(c, p) => this.onItemPartEdit(c, p)} 
            />
    } else if (item.contentType === 'Ordering') {
        return <Ordering
            {...this.props}
            onRemove={this.onRemove}
            onFocus={this.onFocusChange}
            onBlur={this.onBlur}
            key={item.guid}
            itemModel={item}
            partModel={part}
            onEdit={(c, p) => this.onItemPartEdit(c, p)} 
            />
    }
  }

  renderItemsAndParts() {

    const items = this.props.model.items.toArray();
    const parts = this.props.model.parts.toArray()
    const toRender = [];
    for (let i = 0; i < items.length; i++) {
      toRender.push(<div key={items[i].guid} className='itemPart'>{this.renderItemPartEditor(items[i], parts[i])}</div>);
    }

    return toRender;
  }

  render() : JSX.Element {
    
    const inlineToolbar = <InlineToolbar>
                            <HtmlToolbarButton tooltip='Insert Fill In the Blank' key='server' icon='server' command={this.fillInTheBlankCommand}/>
                            <HtmlToolbarButton tooltip='Insert Numeric Input' key='info' icon='info' command={this.numericCommand}/>
                            <HtmlToolbarButton tooltip='Insert Text Input' key='i-cursor' icon='i-cursor' command={this.textCommand}/>
                          </InlineToolbar>;

    const blockToolbar = <BlockToolbar/>;

    const bodyStyle = {
      minHeight: '30px',
      borderStyle: 'none',
      borderWith: '1px',
      borderColor: '#AAAAAA'
    }

    const expanded = (
    <div className="dropdown" style={{display: 'inline'}}>
      <button className="btn btn-secondary btn-link dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        Add Item
      </button>
      <div className="dropdown-menu">
        <a onClick={() => this.onAddMultipleChoice('single')} className="dropdown-item" href="#">Multiple choice</a>
        <a onClick={() => this.onAddMultipleChoice('multiple')} className="dropdown-item" href="#">Check all that apply</a>
        <a onClick={this.onAddOrdering} className="dropdown-item" href="#">Ordering</a>
        <a onClick={this.onAddShortAnswer} className="dropdown-item" href="#">Short answer</a>
        <a onClick={this.onInsertNumeric} className="dropdown-item" href="#">Numeric</a>
        <a onClick={this.onInsertText} className="dropdown-item" href="#">Text</a>
        <a onClick={this.onInsertFillInTheBlank} className="dropdown-item" href="#">Fill in the Blank</a>
      </div>
    </div>);

    return (
    
      <div className='componentWrapper'>

        <Collapse caption='Question' 
          details={getHtmlDetails(this.props.model.body)}
          expanded={expanded}>

          <HtmlContentEditor 
                ref={(c) => this.htmlEditor = c}
                {...this.props}
                activeItemId={this.state.activeItemId}
                editorStyles={bodyStyle}
                inlineToolbar={inlineToolbar}
                blockToolbar={blockToolbar}
                model={this.props.model.body}
                onEdit={this.onBodyEdit} 
                />

          <ConceptsEditor 
            {...this.props}
            model={this.props.model.concepts}
            onEdit={this.onConceptsEdit} 
            title='Skills'
            conceptType='skill'    
            />

          {this.renderItemsAndParts()}

        </Collapse>
      </div>);
  }

}

