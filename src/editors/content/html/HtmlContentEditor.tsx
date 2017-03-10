'use strict'

import * as React from 'react';
import { ContentState, EditorState, ContentBlock, convertToRaw } from 'draft-js';

import * as contentTypes from '../../../data/contentTypes';
import { AuthoringActionsHandler, AuthoringActions } from '../../../actions/authoring';
import { AppServices } from '../../common/AppServices';
import DraftWrapper from '../../content/common/draft/DraftWrapper';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import EditorManager from '../../manager/EditorManager';
import ToolbarManager from '../common/ToolbarManager';

export interface HtmlContentEditor {
  _onChange: (e: any) => void;
}

var toHtml = function(block: ContentBlock, onEditModeChange) {
  return <div key={block.key} onClick={() => onEditModeChange(block.key, false)}><p>{block.text}</p></div>;
};

var toEditor = function(services, userId, editMode, id) {

  return <EditorManager 
          key={id}
          editMode={editMode}
          services={services} 
          userId={userId} 
          documentId={id}/>
};

var convert = function(services, userId, activeEditId: string, content, onEditModeChange) {
  
  return content.blocks.map(block => {
    if (block.type === 'atomic') {
      return toEditor(services, userId, activeEditId === block.key,
        content.entityMap[block.entityRanges[0].key].data.id);
    } else {
      return toHtml(block, onEditModeChange);
    }
  })
};

export interface HtmlContentEditorProps extends AbstractContentEditorProps {

  // Initial content to display
  content: contentTypes.HtmlContent;

  onEdit: (newContent: contentTypes.HtmlContent) => void;

  editHistory: AuthoringActions[];

  userId: string;

  services: AppServices;

  blockKey?: string;
  
}

export interface HtmlContentEditorState {

  activeContent: contentTypes.HtmlContent;

  subEditKey: string;
}

/**
 * The content editor for HtmlContent.
 */
export abstract class HtmlContentEditor 
  extends AbstractContentEditor<HtmlContentEditorProps, HtmlContentEditorState> {
    
  constructor(props) {
    super(props);

    this.state = {
      activeContent: this.props.content,
      subEditKey: null
    }

    this._onChange = this.onChange.bind(this);
  }


  onChange(content: contentTypes.HtmlContent) {
    this.props.onEdit(content);
  } 


  componentWillReceiveProps(nextProps) {
    if (this.props.content !== nextProps.content) {
      this.setState({
        activeContent: nextProps.content
      })
    }
  }

  onSubEdit(key: string, mode: boolean) {
    this.props.onEditModeChange(key, !mode);
    this.setState({ subEditKey: key});
  }

  render() : JSX.Element {

    if (this.props.editMode) {
      return ( 
        <ToolbarManager toolbar={this.props.children}>
          <DraftWrapper 
              onEditModeChange={this.onSubEdit.bind(this)}
              services={this.props.services}
              userId={this.props.userId}
              editHistory={this.props.editHistory} 
              content={this.state.activeContent} 
              locked={!this.props.editingAllowed}
              subEditKey={this.state.subEditKey}
              onEdit={this._onChange} />
        </ToolbarManager>);
    } else {
      const pureHtml = convert(this.props.services, this.props.userId, 
        this.state.subEditKey, this.state.activeContent,this.props.onEditModeChange);
      return (<div>{pureHtml}</div>);
    }
    
  }

}

