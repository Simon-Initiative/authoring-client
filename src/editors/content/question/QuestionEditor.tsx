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
import { PartEditor } from '../part/PartEditor';
import { Collapse } from '../common/Collapse';
import { getHtmlDetails } from '../common/details';
import InlineToolbar from '../html/InlineToolbar';
import BlockToolbar from '../html/BlockToolbar';
import { ConceptsEditor } from '../concepts/ConceptsEditor';

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
    model = this.props.model.with({parts: this.props.model.parts.set(part.guid, part)});
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
    model = this.props.model.with({parts: this.props.model.parts.set(part.guid, part) });

    this.props.onEdit(model);
  }

  renderItemPartEditor(item: contentTypes.Item, part: contentTypes.Part) {
    if (item.contentType === 'MultipleChoice') {
          return <MultipleChoice
            titleOracle={this.props.titleOracle}
            key={item.guid}
            documentId={this.props.documentId}
            courseId={this.props.courseId}
            onEditModeChange={this.props.onEditModeChange}
            editMode={this.props.editMode}
            services={this.props.services}
            userId={this.props.userId}
            itemModel={item}
            partModel={part}
            onEdit={(c, p) => this.onItemPartEdit(c, p)} 
            editingAllowed={this.props.editingAllowed}/>
    } else {
      // TODO build unsupported part item editor
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

  render() : JSX.Element {
    
    const inlineToolbar = <InlineToolbar 
                courseId={this.props.courseId} 
                services={this.props.services} 
                actionHandler={this} />;
    const blockToolbar = <BlockToolbar 
                documentId={this.props.documentId}
                courseId={this.props.courseId} 
                services={this.props.services} 
                actionHandler={this} />;

    const bodyStyle = {
      minHeight: '30px',
      borderStyle: 'none',
      borderWith: '1px',
      borderColor: '#AAAAAA'
    }
    
    return (
    

      <div className="editorWrapper">

        <Collapse caption='Question' details={getHtmlDetails(this.props.model.body)}>

          <form className="form-inline">
           
            <label htmlFor={this.ids.id} className="col-2 col-form-label">Id</label>
            <input onChange={this.onIdEdit} className="form-control form-control-sm" type="text" value={this.state.id} id={this.ids.id}/>

            <button onClick={this.onAddItemPart} type="button" className="btn btn-sm btn-primary">Add Item/Part</button>
            
          </form>

          <div><b>Body</b></div>
          <HtmlContentEditor 
                titleOracle={this.props.titleOracle}
                editorStyles={bodyStyle}
                inlineToolbar={inlineToolbar}
                blockToolbar={blockToolbar}
                onEditModeChange={this.props.onEditModeChange}
                editMode={this.props.editMode}
                services={this.props.services}
                courseId={this.props.courseId}
                documentId={this.props.documentId}
                userId={this.props.userId}
                editHistory={this.state.editHistory}
                model={this.props.model.body}
                onEdit={this.onBodyEdit} 
                editingAllowed={this.props.editingAllowed}
                
                />

          <ConceptsEditor 
            titleOracle={this.props.titleOracle}
            model={this.props.model.concepts}
            courseId={this.props.courseId}
            documentId={this.props.documentId}
            userId={this.props.userId}
            onEdit={this.onConceptsEdit} 
            editingAllowed={this.props.editingAllowed}
            onEditModeChange={this.props.onEditModeChange}
            editMode={this.props.editMode}
            services={this.props.services}
            title='Skills'
            conceptType='skill'    
            />

          {this.renderItemsAndParts()}

        </Collapse>

      </div>);
  }

}

