'use strict'

import * as React from 'react';
import * as Immutable from 'immutable';
import { ContentState, EditorState, ContentBlock, convertToRaw, SelectionState } from 'draft-js';
import * as contentTypes from '../../../data/contentTypes';
import { AuthoringActionsHandler, AuthoringActions } from '../../../actions/authoring';
import { AppServices } from '../../common/AppServices';
import DraftWrapper from '../../content/common/draft/DraftWrapper';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import guid from '../../../utils/guid';
import '../common/editor.scss';
import { HtmlContentEditor } from '../html/HtmlContentEditor';
import { UnsupportedEditor } from '../unsupported/UnsupportedEditor';
import { MultipleChoice } from '../items/MultipleChoice';
import { CheckAllThatApply } from '../items/CheckAllThatApply';
import { Numeric } from '../items/Numeric';
import { Text } from '../items/Text';
import { FillInTheBlank } from '../items/FillInTheBlank';
import { Collapse } from '../common/Collapse';
import { getHtmlDetails } from '../common/details';
import { EntityTypes } from '../../../data/content/html/common';
import { Toolbar, ToolbarActionProvider } from '../common/toolbar/Toolbar';
import { ToolbarButton } from '../common/toolbar/ToolbarButton';
import * as toolbarConfigs from '../common/toolbar/Configs';
import { ConceptsEditor } from '../concepts/ConceptsEditor';
import { TextInput, InlineForm, Button, Checkbox } from '../common/controls';
import { changes } from '../../../data/content/html/changes';

type Ids = {
  id: string
}

export interface QuestionEditor {
  ids: Ids;
  lastBody: contentTypes.Html
}

export interface QuestionEditorProps extends AbstractContentEditorProps<contentTypes.Question> {

}

export interface QuestionEditorState {

  editHistory: Immutable.List<AuthoringActions>;

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
      editHistory: Immutable.List<AuthoringActions>(),
      activeItemId: null
    };

    this.ids = {
      id: guid()
    }

    this.onBodyEdit = this.onBodyEdit.bind(this);
    this.onItemPartEdit = this.onItemPartEdit.bind(this);
    this.onAddMultipleChoice = this.onAddMultipleChoice.bind(this);
    this.onConceptsEdit = this.onConceptsEdit.bind(this);
    this.onFillInTheBlank = this.onFillInTheBlank.bind(this);
    this.onNumeric = this.onNumeric.bind(this);
    this.onText = this.onText.bind(this);
    
    this.onFocusChange = this.onFocusChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  onBlur(activeItemId: string) {
    if (this.state.activeItemId === activeItemId) {
      this.setState({ activeItemId: null });
    }
  }

  handleAction(action: AuthoringActions) {
    this.setState({
      editHistory: this.state.editHistory.insert(0, action)
    });
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

  renderItemPartEditor(item: contentTypes.Item, part: contentTypes.Part) {
    if (item.contentType === 'MultipleChoice' && item.select === 'single') {
        return <MultipleChoice
          {...this.props}
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
      toRender.push(this.renderItemPartEditor(items[i], parts[i]));
    }

    return toRender;
  }

  addItem(a: ToolbarActionProvider, item, typeLabel) {
    const input = guid();
    const data = {};
    data['@input'] = input;
    data['$type'] = typeLabel;

    a.insertInlineEntity(EntityTypes.input_ref, 'IMMUTABLE', data);
    
    item = item.with({guid: input, id: input});

    let model = this.props.model.with({items: this.props.model.items.set(item.guid, item) });

    let part = new contentTypes.Part();
    part = part.with({guid: guid()});
    model = model.with({parts: model.parts.set(part.guid, part) });

    this.props.onEdit(model);
  }

  onFillInTheBlank(a: ToolbarActionProvider) {
    this.addItem(a, new contentTypes.FillInTheBlank(), 'FillInTheBlank');
  }

  onNumeric(a: ToolbarActionProvider) {
    this.addItem(a, new contentTypes.Numeric(), 'Numeric');
  }

  onText(a: ToolbarActionProvider) {
    this.addItem(a, new contentTypes.Text(), 'Text');
  }

  render() : JSX.Element {
    
    const inlineToolbar = <Toolbar 
                context={this.props.context} 
                services={this.props.services} 
                actionHandler={this}>
                  {toolbarConfigs.flowInline()}
                  <ToolbarButton key='server' icon='server' action={this.onFillInTheBlank}/>
                  <ToolbarButton key='info' icon='info' action={this.onNumeric}/>
                  <ToolbarButton key='i-cursor' icon='i-cursor' action={this.onText}/>
                </Toolbar>
    const blockToolbar = <Toolbar 
                context={this.props.context} 
                services={this.props.services} 
                actionHandler={this}>
                  {toolbarConfigs.flowBlock()}
                </Toolbar>

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
        <a className="dropdown-item" href="#">Ordering</a>
        <a className="dropdown-item" href="#">Short answer</a>
      </div>
    </div>);

    return (
    
        <Collapse caption='Question' 
          details={getHtmlDetails(this.props.model.body)}
          expanded={expanded}>

          <div className='questionWrapper'>

          <HtmlContentEditor 
                {...this.props}
                activeItemId={this.state.activeItemId}
                editorStyles={bodyStyle}
                inlineToolbar={inlineToolbar}
                blockToolbar={blockToolbar}
                editHistory={this.state.editHistory}
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

          </div>

        </Collapse>);
  }

}

