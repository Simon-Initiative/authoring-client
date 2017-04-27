'use strict'

import * as React from 'react';
import * as Immutable from 'immutable';

import {Editor, EditorState, CompositeDecorator, ContentState, SelectionState,
  ContentBlock, convertFromRaw, convertToRaw, AtomicBlockUtils, RichUtils, Modifier } from 'draft-js';
import { CommandProcessor, Command } from '../command';
import { wrappers } from './wrappers/wrappers';
import { ContentWrapper } from './wrappers/common';
import { determineChangeType, SelectionChangeType } from './utils';
import { BlockProps } from './renderers/properties';
import { AuthoringActions } from '../../../../actions/authoring';
import { AppServices } from '../../../common/AppServices';
import { AppContext } from '../../../common/AppContext';
import * as common from '../../../../data/content/html/common';
import { Html } from '../../../../data/contentTypes';
import { EntityTypes } from '../../../../data/content/html/common';
import { getRendererByName, BlockRenderer } from './renderers/registry';
import { buildCompositeDecorator } from './decorators/composite';
import handleBackspace from './keyhandlers/backspace';
import { getCursorPosition, hasSelection, getPosition } from './utils';


export type ChangePreviewer = (current: Html, next: Html) => Html;


const SHIFT_KEY = 16;
const ENTER_KEY = 13; 
const ALT_KEY = 18; 
const PADDING = 30;

interface DraftWrapper {
  onChange: any;
  focus: () => any; 
  handleKeyCommand: any;
  lastSelectionState: SelectionState;
  lastContent: ContentState;
  container: any;
  _onKeyDown: () => void;
  _onKeyUp: () => void;
  mouseDown: boolean; 
  shiftPressed: boolean;
  _dismissToolbar: () => void;
}

export interface DraftWrapperProps {
  onEdit: (html : Html) => void;
  onSelectionChange: (state: SelectionState) => void;
  content: Html;
  locked: boolean;
  context: AppContext;
  services: AppServices;
  inlineToolbar: any;
  blockToolbar: any;
  activeItemId: string;
  editorStyles?: Object;
  changePreviewer?: ChangePreviewer;
}



interface DraftWrapperState {
  editorState: EditorState;
  lockedByBlockRenderer: boolean;
  show: boolean;
  component: any;
  x: number;
  y: number;
}

const styles = {
  editor: {
    border: 'none',
    cursor: 'text',
    minHeight: 300
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

  let viewer = getRendererByName(type).viewer;

  let childProps = Object.assign({}, props, { data });

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




class DraftWrapper extends React.Component<DraftWrapperProps, DraftWrapperState>
  implements CommandProcessor<EditorState> {

  constructor(props) {
    super(props);

    this.focus = () => (this.refs as any).editor.focus();
    this.handleKeyCommand = this._handleKeyCommand.bind(this);
    this.lastSelectionState = null;

    this._dismissToolbar = this.dismissToolbar.bind(this);
    this.mouseDown = false;
    this.shiftPressed = false;

    this._onKeyDown = this.onKeyDown.bind(this);
    this._onKeyUp = this.onKeyUp.bind(this);
    this.onBlur = this.onBlur.bind(this);

    const contentState = props.content.contentState;
    this.lastContent = contentState;

    const onDecoratorEdit = () => this.onChange(this.state.editorState);
    const compositeDecorator = buildCompositeDecorator({ activeItemId: this.props.activeItemId, services: this.props.services, onEdit: onDecoratorEdit });

    const es = EditorState.createWithContent(contentState, compositeDecorator);
    const newEditorState = EditorState.set(es, { allowUndo: false });

    this.state = {
      editorState: newEditorState,
      lockedByBlockRenderer: false,
      show: false,
      x: null,
      y: null,
      component: null
    };
    
    this.onChange = (editorState : EditorState) => {
    
      // You wouldn't think that this check would be necessary, but I was seeing
      // change notifications fired from Draft even when it was not in edit mode.
      if (!this.props.locked) {

        const ss = editorState.getSelection();
        const changeType : SelectionChangeType = determineChangeType(this.lastSelectionState, ss);
        this.lastSelectionState = ss; 
        this.handleSelectionChange(changeType, ss);

        const contentState = editorState.getCurrentContent();
        const contentChange = (contentState !== this.lastContent);
        
        if (contentChange) {
          this.lastContent = contentState;
          this.setState({editorState}, () => this.props.onEdit(new Html({ contentState })));
        } else {
          this.setState({editorState});
        }
        
        
      }
    };
  }



  forceContentChange(contentState, changeType) {
    this.lastContent = contentState;
    const editorState = EditorState.push(this.state.editorState, contentState, changeType);
    this.setState({editorState}, () => {
      this.props.onEdit(new Html({ contentState }));
      this.forceRender();
    });
  }

  appendText(contentBlock, contentState, text) {

    const targetRange = new SelectionState({
      anchorKey: contentBlock.key,
      focusKey: contentBlock.key,
      anchorOffset: contentBlock.text.length,
      focusOffset: contentBlock.text.length
    })

    return Modifier.insertText(
      contentState,
      targetRange,
      text);
    
  }

  onBlur() {
    if (this.state.show) {
      setTimeout(() => this.setState({ show: false, x: null, y: null}), 200);
    }
  }

  handleSelectionChange(changeType, ss) {
    
    if (changeType === SelectionChangeType.Selection) {  
      if (hasSelection(ss)) {
        const selection = document.getSelection();
        if (selection.rangeCount !== 0) {
          let topRect = getPosition();

          if (topRect === null) {
            this.setState({ show: false, x: null, y: null});
            return;
          }
          
          const divRect = this.container.getBoundingClientRect();

          const y = topRect.top - PADDING;
          
          if (topRect !== null) {
            const show = !this.shiftPressed;

            this.setState({show, x: topRect.left, y, component: this.props.inlineToolbar});
            
        } else {
            this.setState({ show: false, x: null, y: null});
          }
        }
      } else {   
        this.setState({ show: false, x: null, y: null});
      }
      
      
    } else if (changeType === SelectionChangeType.CursorPosition) {
      this.setState({ show: false, x: null, y: null});
    } 
  }
  

  dismissToolbar() {
    this.setState({show: false, x: null, y: null});
  }

  onKeyDown(e) {
    if (e.keyCode === SHIFT_KEY) {
      this.shiftPressed = true;
    } else if (e.keyCode === ALT_KEY) {
      const point = getCursorPosition();
      this.setState({
        show: true, 
        x: point.x, 
        y: point.y, 
        component: this.props.blockToolbar
      });        
    }
  }

  onKeyUp(e) {
    
    if (e.keyCode === SHIFT_KEY) {
      this.shiftPressed = false;

      if (this.state.x !== null) {
        this.setState({show: true});
      }

    } else if (e.keyCode === ENTER_KEY) {
      // Every time the user presses 'Enter', we display
      // the block toolbar just below their cursor
      const point = getCursorPosition();
      this.setState({
        show: true, 
        x: point.x, 
        y: point.y + PADDING, 
        component: this.props.blockToolbar
      });        
    } else if (e.keyCode === ALT_KEY) {
      this.setState({show: false, x: null, y: null});
    }
  }

  getXOffset() {
    const position = this.container.getBoundingClientRect();  
    return position.left;
  }

  processBlockEdit(block, data) {

    const content = this.state.editorState.getCurrentContent();

    const entityKey = block.getEntityAt(0);
    const newContentState = content.mergeEntityData(entityKey, data);

    this.forceContentChange(newContentState, 'apply-entity');

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
            //this.props.onEditModeChange(block.getKey(), editMode);
          },
          onEdit: (data) => {
            this.processBlockEdit(block, data);
          },
          services: this.props.services,
          context: this.props.context
        }
      };
    }

    return null;
  }

  _handleKeyCommand(command) {

    const editorState = this.state.editorState;
    
    if (command === 'backspace') {
      if (handleBackspace(editorState, this.onChange) === 'handled') {
        return 'handled';
      }
    }

    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return 'handled';
    } else {
      return 'not-handled';
    }
    
  }
  

  

  componentWillReceiveProps(nextProps: DraftWrapperProps) {

    if (this.props.activeItemId !== nextProps.activeItemId) {
      setTimeout(() => this.forceRender(), 100);
      
    } else if (this.props.content.contentState !== nextProps.content.contentState) {

      const current = this.state.editorState.getCurrentContent();

      if (nextProps.content.contentState !== current) {

        const selection = this.state.editorState.getSelection();

        const onDecoratorEdit = () => this.onChange(this.state.editorState);
        const compositeDecorator = buildCompositeDecorator({ activeItemId: this.props.activeItemId, services: this.props.services, onEdit: onDecoratorEdit });

        const es = EditorState.createWithContent(nextProps.content.contentState, compositeDecorator);
        const newEditorState = EditorState.forceSelection(EditorState.set(es, { allowUndo: false }), selection);

        this.setState({
          editorState: newEditorState
        });
      }
    }
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

  process(command: Command<EditorState>) {
    command.execute(this.state.editorState, this.props.context, this.props.services)
      .then(newState => this.onChange(newState));
  }

  forceRender() {

    const editorState = this.state.editorState;
    const content = editorState.getCurrentContent();
    const onDecoratorEdit = () => this.onChange(this.state.editorState);
    const compositeDecorator = buildCompositeDecorator({ activeItemId: this.props.activeItemId, services: this.props.services, onEdit: onDecoratorEdit });

    const es = EditorState.createWithContent(content, compositeDecorator);
    const newEditorState = EditorState.set(es, { allowUndo: false });
    this.setState({editorState: newEditorState});
  }

  renderToolbar() {
    let toolbarAndContainer = null;
    if (this.state.show) {
      
      const clonedToolbar = React.cloneElement(this.state.component, { commandProcessor: this, dismissToolbar: this._dismissToolbar});
      
      const positionStyle = {
        position: 'fixed',
        top: this.state.y,
        left: this.state.x
      };

      return <div style={positionStyle}>
          {clonedToolbar}
        </div>;
      
    } else {
      return null;
    }

  }

  render() {

    const editorStyle = this.props.editorStyles !== undefined ? this.props.editorStyles : styles.editor;
    
    return (
      <div ref={(container => this.container = container)} 
        onBlur={this.onBlur}
        onKeyUp={this._onKeyUp}
        onKeyDown={this._onKeyDown}
        style={editorStyle} 
        onClick={this.focus}>

        {this.renderToolbar()}

        <Editor ref="editor"
          spellCheck={true}
          renderPostProcess={this.renderPostProcess.bind(this)}
          customStyleMap={styleMap}
          handleKeyCommand={this.handleKeyCommand}
          blockRendererFn={this.blockRenderer.bind(this)}
          editorState={this.state.editorState} 
          readOnly={this.state.lockedByBlockRenderer || this.props.locked}
          onChange={this.onChange} />

      </div>);
  }

}

export default DraftWrapper;
