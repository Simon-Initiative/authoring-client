'use strict'

import * as React from 'react';
import * as Immutable from 'immutable';

import {Editor, EditorState, CompositeDecorator, ContentState, SelectionState,
  ContentBlock, convertFromRaw, convertToRaw, AtomicBlockUtils, RichUtils, Modifier } from 'draft-js';
import { wrappers } from './wrappers/wrappers';
import { ContentWrapper } from './wrappers/common';
import { determineChangeType, SelectionChangeType } from './utils';
import { BlockProps } from './renderers/properties';
import { htmlContentToDraft } from './translation/todraft';
import { draftToHtmlContent } from './translation/topersistence';
import { AuthoringActions } from '../../../../actions/authoring';
import { AppServices } from '../../../common/AppServices';
import * as common from './translation/common';
import { HtmlContent } from '../../../../data/contentTypes';
import { EntityTypes } from './custom';
import { getActivityByName, BlockRenderer } from './renderers/registry';
import { buildCompositeDecorator } from './decorators/composite';
import handleBackspace from './keyhandlers/backspace';

interface DraftWrapper {
  onChange: any;
  focus: () => any; 
  handleKeyCommand: any;
  lastSelectionState: SelectionState;
}

export interface DraftWrapperProps {
  editHistory: AuthoringActions[];
  onEdit: (HtmlContent) => void;
  onSelectionChange: (state: SelectionState) => void;
  onEditModeChange: (key: string, mode: boolean) => void;
  content: HtmlContent;
  locked: boolean;
  userId: string;
  services: AppServices;
}



interface DraftWrapperState {
  editorState: EditorState;
  lockedByBlockRenderer: boolean;
}

const styles = {
  root: {
    fontFamily: '\'Helvetica\', sans-serif',
    padding: 20,
    width: 600,
  },
  editor: {
    border: 'none',
    cursor: 'text',
    minHeight: 300,
    padding: 10,
  },
  button: {
    marginTop: 10,
    textAlign: 'center',
  },
  link: {

  }
};

const styleMap = {
  SUBSCRIPT: {
    lineHeight: '0',
    position: 'relative',
    verticalAlign: 'baseline',
    fontSize: '75%',
    bottom: '-0.25em'
  },
  SUPERSCRIPT: {
    lineHeight: '0',
    position: 'relative',
    verticalAlign: 'baseline',
    fontSize: '75%',
    top: '-0.5em'
  },
  CITE: {
    fontStyle: 'italic',
    textDecoration: 'underline'
  },
  TERM: {
    textDecoration: 'underline'
  },
  IPA: {
    // TODO
  },
  FOREIGN: {
    // TODO
  },
  SYM: {
    // TODO
  }
};

const blockRenderMap = Immutable.Map({
  'header-one': { element: 'h1' },
  'header-two': { element: 'h2' },
  'header-three': { element: 'h3' },
  'header-four': { element: 'h4' },
  'header-five': { element: 'h5' },
  'header-six': { element: 'h6' },
  'blockquote': { element: 'blockquote' },
  'code-block': { element: 'pre' },
  'atomic': { element: 'div' },
  'unordered-list-item': { element: 'li' },
  'ordered-list-item': { element: 'li' },
  'unstyled': { element: 'div' }
});


const BlockRendererFactory = (props) => {
  const entity = props.contentState.getEntity(
    props.block.getEntityAt(0)
  );
  const data = entity.getData();
  const type = entity.getType();

  let viewer = getActivityByName(type).viewer;

  let childProps = Object.assign({}, props, data);

  return React.createElement((viewer as any), childProps);
};


function splitBlockInContentState(
  contentState: ContentState,
  selectionState: SelectionState,
): ContentState {
  
  var key = selectionState.getAnchorKey();
  var offset = selectionState.getAnchorOffset();
  var blockMap = contentState.getBlockMap();
  var blockToSplit = blockMap.get(key);

  var text = blockToSplit.getText();
  var chars = blockToSplit.getCharacterList();

  var blockAbove = blockToSplit.merge({
    text: text.slice(0, offset),
    characterList: chars.slice(0, offset),
  });

  const dataAbove = blockAbove.data.toJSON();
  
  const toPreserve = Object.keys(dataAbove)
    .filter(key => key.startsWith('oli') || key === 'semanticContext')
    .reduce((o, key) => {
      o[key] = dataAbove[key]
      return o;
    }, {});
  

  var keyBelow = common.generateRandomKey();
  var blockBelow = blockAbove.merge({
    key: keyBelow,
    text: text.slice(offset),
    characterList: chars.slice(offset),
    data: Immutable.Map(toPreserve),
  });

  var blocksBefore = blockMap.toSeq().takeUntil(v => v === blockToSplit);
  var blocksAfter = blockMap.toSeq().skipUntil(v => v === blockToSplit).rest();
  var newBlocks = blocksBefore.concat(
    [[blockAbove.getKey(), blockAbove], [blockBelow.getKey(), blockBelow]],
    blocksAfter,
  ).toOrderedMap();

  return contentState.merge({
    blockMap: newBlocks,
    selectionBefore: selectionState,
    selectionAfter: selectionState.merge({
      anchorKey: keyBelow,
      anchorOffset: 0,
      focusKey: keyBelow,
      focusOffset: 0,
      isBackward: false,
    }),
  });
}


class DraftWrapper extends React.Component<DraftWrapperProps, DraftWrapperState> {

  constructor(props) {
    super(props);

    this.focus = () => (this.refs as any).editor.focus();
    this.handleKeyCommand = this._handleKeyCommand.bind(this);
    this.lastSelectionState = null;

    
    const contentState : ContentState = htmlContentToDraft(this.props.content);

    const onDecoratorEdit = () => this.onChange(this.state.editorState);
    const compositeDecorator = buildCompositeDecorator({ services: this.props.services, onEdit: onDecoratorEdit });

    this.state = {
      editorState: EditorState.createWithContent(contentState, compositeDecorator),
      lockedByBlockRenderer: false
    };
    
    this.onChange = (editorState) => {
      
      
      // You wouldn't think that this check would be necessary, but I was seeing
      // change notifications fired from Draft even when it was not in edit mode.
      if (!this.props.locked) {

        const ss = editorState.getSelection();
        const changeType : SelectionChangeType = determineChangeType(this.lastSelectionState, ss);
        this.lastSelectionState = ss; 

        console.log('selection state');
        console.log(ss.toJSON());
        
        // Report any change, including initial change 
        if (changeType !== SelectionChangeType.None) {
          this.props.onSelectionChange(ss);
        }

        const content = editorState.getCurrentContent();
        
        const htmlContent : HtmlContent = draftToHtmlContent(editorState.getCurrentContent());
        this.props.onEdit(htmlContent);

        return this.setState({editorState})
      }
    };
  }

  processBlockEdit(block, data) {

    const content = this.state.editorState.getCurrentContent();

    var entityKey = block.getEntityAt(0);
    var newContentState = content.mergeEntityData(entityKey, data);

    const htmlContent : HtmlContent = draftToHtmlContent(newContentState);
    this.props.onEdit(htmlContent);
  }

  blockRenderer(block) {
    if (block.getType() === 'atomic') {
      return {
        component: BlockRendererFactory,
        editable: false,
        props: {
          onLockChange: (locked) => {
            this.setState({ lockedByBlockRenderer: locked });
          },
          onEditModeChange: (editMode) => {
            this.props.onEditModeChange(block.getKey(), editMode);
          },
          onEdit: (data) => {
            this.processBlockEdit(block, data);
          },
          services: this.props.services,
          userId: this.props.userId
        }
      };
    }

    return null;
  }

  _handleKeyCommand(command) {

    const editorState = this.state.editorState;
    
    if (command === 'backspace') {
      if (handleBackspace(editorState, this.onChange) === 'handled') {
        console.log('handled by custom backspace');
        return 'handled';
      }
    }

    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      console.log('handled by richutils');
      this.onChange(newState);
      return 'handled';
    } else {
      console.log('not handled at all');
      return 'not-handled';
    }
    
  }
  

  toggleInlineStyle(inlineStyle) {

    const updateStyle = RichUtils.toggleInlineStyle(this.state.editorState, inlineStyle);

    const key : string = this.state.editorState.getSelection().getAnchorKey();
    const clearedSelection = EditorState.acceptSelection(updateStyle, SelectionState.createEmpty(key))

    this.onChange(clearedSelection);
  }

  componentWillReceiveProps(nextProps: DraftWrapperProps) {

    // Determine if we have received a new edit action
    if (this.props.editHistory.length !== nextProps.editHistory.length) {
      let action : any = nextProps.editHistory[0];
      if (action.type === 'TOGGLE_INLINE_STYLE') {
        this.toggleInlineStyle(action.style);
      } else if (action.type === 'INSERT_ACTIVITY') {
        this.insertActivity(action.activityType, action.data);
      } else if (action.type === 'TOGGLE_BLOCK_TYPE') {
        this.toggleBlockType(action.blockType);
      } else if (action.type === 'INSERT_INLINE_ENTITY') {
        this.insertInlineEntity(action.entityType, action.mutability, action.data);
      }
    } 
  }

  insertInlineEntity(type: string, mutability: string, data: Object) {
    const contentState = this.state.editorState.getCurrentContent();
    const selectionState = this.state.editorState.getSelection();
    const contentStateWithEntity = contentState.createEntity(type, mutability, data);
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const contentStateWithLink = Modifier.applyEntity(
      contentState,
      selectionState,
      entityKey
    );

    const newEditorState = EditorState.set(
        this.state.editorState,
        { currentContent: contentStateWithLink });

    this.onChange(newEditorState);
  }

  insertActivity(type, data) {
      const {editorState} = this.state;
      const contentState = editorState.getCurrentContent();
      const contentStateWithEntity = contentState.createEntity(
        type,
        'IMMUTABLE',
        data
      );
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      const newEditorState = EditorState.set(
        editorState,
        {currentContent: contentStateWithEntity}
      );

      this.onChange(AtomicBlockUtils.insertAtomicBlock(
          newEditorState,
          entityKey,
          ' '
        ));
    }

  toggleBlockType(type) {
    const updateStyle = RichUtils.toggleBlockType(this.state.editorState, type);
    this.onChange(updateStyle);
  }



  renderPostProcess(components, blocks) {
    
    const updated = [];
    let children = []; 
    let current = updated;

    const content =  this.state.editorState.getCurrentContent();

    let currentWrapper : ContentWrapper = null;
    
    for (let i = 0; i < components.length; i++) {
      
      let comp = components[i];
      let block = content.getBlockForKey(comp.key);

      // Block will be undefined when what we have encountered is a Draft
      // block level wrapper such as a ol or a ul that is wrapping a series
      // of li blocks.  
      if (block === undefined) {
        updated.push(comp);
        continue;
      }

      if (currentWrapper === null) {

        let foundWrapperBegin = wrappers.find((w) => w.isBeginBlock(block, content));
        if (foundWrapperBegin !== undefined) {
          
          currentWrapper = foundWrapperBegin;

          children = [];
          current = children;
          
          children.push(components[i]);

        } else {
          current.push(components[i]);
        }

      } else if (currentWrapper.isEndBlock(block, content)) {

        children.push(components[i]);
        updated.push(React.createElement(currentWrapper.component, {key: 'block-' + block.key}, children));

        current = updated;

      } else {
        current.push(components[i]);
      }
      
    }

    return updated;
  }

  render() {
    return <div 
        style={styles.editor} 
        onClick={this.focus}>

        <Editor ref="editor"
          renderPostProcess={this.renderPostProcess.bind(this)}
          customStyleMap={styleMap}
          handleKeyCommand={this.handleKeyCommand}
          blockRendererFn={this.blockRenderer.bind(this)}
          editorState={this.state.editorState} 
          readOnly={this.state.lockedByBlockRenderer || this.props.locked}
          onChange={this.onChange} />

      </div>;
  }

}

export default DraftWrapper;
