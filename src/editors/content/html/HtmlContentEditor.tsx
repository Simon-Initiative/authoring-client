'use strict'

import * as React from 'react';
import { ContentState, EditorState, ContentBlock, convertToRaw, SelectionState } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import * as contentTypes from '../../../data/contentTypes';
import { AuthoringActionsHandler, AuthoringActions } from '../../../actions/authoring';
import { AppServices } from '../../common/AppServices';
import DraftWrapper from '../../content/common/draft/DraftWrapper';
import { AbstractContentEditor, AbstractContentEditorProps } from '../common/AbstractContentEditor';
import EmbeddedEditorManager from '../../manager/EmbeddedEditorManager';
import ToolbarManager from '../common/ToolbarManager';
import { htmlContentToDraft } from '../common/draft/translate';

export interface HtmlContentEditor {
  _onChange: (e: any) => void;
  container: any;
}

var toHtml = function(block: ContentBlock, onEditModeChange) {

  const content = {
    blocks: [block],
    entityMap: {}
  };

  const converted : string = stateToHTML(htmlContentToDraft(content as any));
  const replaced = '<div>' + converted.substring(3, converted.length - 4) +  '</div>';

  const html = {
    __html: replaced
  };

  return <div 
    key={block.key} 
    dangerouslySetInnerHTML={html} />;
};

var toEditor = function(services, userId: string, editMode: boolean, id: string, blockKey: string, onEditModeChange) {

  return <EmbeddedEditorManager 
          onEditModeChange={onEditModeChange}
          key={id}
          editMode={editMode}
          blockKey={blockKey}
          services={services} 
          userId={userId} 
          documentId={id}/>
};

var convert = function(services, userId, activeEditId: string, content, onEditModeChange) {
  
  return content.blocks.map(block => {
    if (block.type === 'atomic') {
      return toEditor(services, userId, activeEditId === block.key,
        content.entityMap[block.entityRanges[0].key].data.id, block.key, onEditModeChange);
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

  activeSubEditorKey?: string; 

  inlineToolbar: any;

  blockToolbar: any;
}

export interface HtmlContentEditorState {

  selectionState: SelectionState;
}

/**
 * The content editor for HtmlContent.
 */
export abstract class HtmlContentEditor 
  extends AbstractContentEditor<HtmlContentEditorProps, HtmlContentEditorState> {
    
  constructor(props) {
    super(props);

    this.state = {
      selectionState: null
    }

    this._onChange = this.onChange.bind(this);
    this.container = null; 
  }


  onChange(content: contentTypes.HtmlContent) {
    this.props.onEdit(content);
  } 

  

  render() : JSX.Element {

    if (this.props.editMode) {
      return (
        <div>
          <ToolbarManager selectionState={this.state.selectionState} 
            inlineToolbar={this.props.inlineToolbar}
            blockToolbar={this.props.blockToolbar}
            >
            <DraftWrapper 
              onSelectionChange={(selectionState) => this.setState({selectionState})}
              onEditModeChange={this.props.onEditModeChange}
              services={this.props.services}
              userId={this.props.userId}
              editHistory={this.props.editHistory} 
              content={this.props.content} 
              locked={!this.props.editingAllowed}
              onEdit={this._onChange} />
          </ToolbarManager>
        </div>);
    } else {
      
      // Do not display an actual Draft editor, but instead convert draft 
      // content into pure HTML.  Continue to style the HTML and enclosing
      // divs exactly the same way that a draft editor would style them 
      // to guarantee that the rendered HTML looks the same as Draft editor 
      // rendered content
      const pureHtml = convert(this.props.services, this.props.userId, 
        this.props.activeSubEditorKey, this.props.content, this.props.onEditModeChange);
      
      const outerStyle = {
        minHeight: '300px',
        padding: '10px'
      }
      const draftStyle = {
        outline: 'none',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word'
      };
      return <div style={outerStyle}>
              <div className="DraftEditor-root">
                <div className="DraftEditor-editorContainer">
                  <div className="public-DraftEditor-content" style={draftStyle}>
                    <div>
                      {pureHtml}
                    </div>
                  </div>
                </div>
              </div>
            </div>
      
    }
    
  }

}

