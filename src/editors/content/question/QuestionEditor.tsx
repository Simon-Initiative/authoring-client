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
import { FillInTheBlank } from '../items/FillInTheBlank';
import { PartEditor } from '../part/PartEditor';
import { Collapse } from '../common/Collapse';
import { getHtmlDetails } from '../common/details';
import { EntityTypes } from '../../../data/content/html/common';
import { Toolbar, ToolbarActionProvider } from '../common/toolbar/Toolbar';
import { ToolbarButton } from '../common/toolbar/ToolbarButton';
import * as toolbarConfigs from '../common/toolbar/Configs';
import { ConceptsEditor } from '../concepts/ConceptsEditor';
import { TextInput, InlineForm, Button, Checkbox } from '../common/controls';

type Ids = {
  id: string
}

export interface QuestionEditor {
  ids: Ids;
}

export interface QuestionEditorProps extends AbstractContentEditorProps<contentTypes.Question> {

}

export interface QuestionEditorState {

  editHistory: Immutable.List<AuthoringActions>;

  id: string;
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
      id: this.props.model.id
    };

    this.ids = {
      id: guid()
    }

    this.onBodyEdit = this.onBodyEdit.bind(this);
    this.onIdEdit = this.onIdEdit.bind(this);
    this.onItemPartEdit = this.onItemPartEdit.bind(this);
    this.onAddItemPart = this.onAddItemPart.bind(this);
    this.onConceptsEdit = this.onConceptsEdit.bind(this);
    this.onFillInTheBlank = this.onFillInTheBlank.bind(this);
  }

  handleAction(action: AuthoringActions) {
    this.setState({
      editHistory: this.state.editHistory.insert(0, action)
    });
  }

  onConceptsEdit(concepts) {
    this.props.onEdit(this.props.model.with({concepts}));
  }

  onBodyEdit(body) {
    const question = this.props.model.with({body});
    this.props.onEdit(question);
  }

  onItemPartEdit(item, part) {
    let model = this.props.model.with({items: this.props.model.items.set(item.guid, item) });
    model = model.with({parts: model.parts.set(part.guid, part)});
    this.props.onEdit(model);
  }

  onIdEdit(e) {
    const id = e.target.value;
    this.setState({ id }, () => 
      this.props.onEdit(this.props.model.with({id })));
  }

  onAddItemPart() {
    let item = new contentTypes.MultipleChoice();
    item = item.with({guid: guid()});

    let model = this.props.model.with({items: this.props.model.items.set(item.guid, item) });

    let part = new contentTypes.Part();
    part = part.with({guid: guid()});
    model = model.with({parts: model.parts.set(part.guid, part) });

    this.props.onEdit(model);
  }

  renderItemPartEditor(item: contentTypes.Item, part: contentTypes.Part) {
    if (item.contentType === 'MultipleChoice') {
        return <MultipleChoice
          context={this.props.context}
          key={item.guid}
          editMode={this.props.editMode}
          services={this.props.services}
          itemModel={item}
          partModel={part}
          onEdit={(c, p) => this.onItemPartEdit(c, p)} 
          />
    } else if (item.contentType === 'FillInTheBlank') {
        return <FillInTheBlank
            context={this.props.context}
            key={item.guid}
            editMode={this.props.editMode}
            services={this.props.services}
            itemModel={item}
            partModel={part}
            onEdit={(c, p) => this.onItemPartEdit(c, p)} 
            />
    } else {

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

  onFillInTheBlank(a: ToolbarActionProvider) {

    const input = guid();
    const data = {};
    data['@input'] = input;
    data['$type'] = contentTypes.FillInTheBlank;

    a.insertInlineEntity(EntityTypes.input_ref, 'IMMUTABLE', data);
    
    let item = new contentTypes.FillInTheBlank();
    item = item.with({guid: input, id: input});

    let model = this.props.model.with({items: this.props.model.items.set(item.guid, item) });

    let part = new contentTypes.Part();
    part = part.with({guid: guid()});
    model = model.with({parts: model.parts.set(part.guid, part) });

    this.props.onEdit(model);

  }

  render() : JSX.Element {
    
    const inlineToolbar = <Toolbar 
                context={this.props.context} 
                services={this.props.services} 
                actionHandler={this}>
                  {toolbarConfigs.flowInline()}
                  <ToolbarButton icon='server' action={this.onFillInTheBlank}/>
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

    const expanded = 
        <Button type='link' onClick={this.onAddItemPart}>Add Item/Part</Button>;

    return (
    
        <Collapse caption='Question' 
          details={getHtmlDetails(this.props.model.body)}
          expanded={expanded}>

          <div className='questionWrapper'>

          <HtmlContentEditor 
                context={this.props.context}
                editorStyles={bodyStyle}
                inlineToolbar={inlineToolbar}
                blockToolbar={blockToolbar}
                editMode={this.props.editMode}
                services={this.props.services}
                editHistory={this.state.editHistory}
                model={this.props.model.body}
                onEdit={this.onBodyEdit} 
                />

          <ConceptsEditor 
            context={this.props.context}
            model={this.props.model.concepts}
            onEdit={this.onConceptsEdit} 
            editMode={this.props.editMode}
            services={this.props.services}
            title='Skills'
            conceptType='skill'    
            />

          {this.renderItemsAndParts()}

          </div>

        </Collapse>);
  }

}

