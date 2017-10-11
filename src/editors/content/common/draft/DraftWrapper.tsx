import * as React from 'react';
import * as Immutable from 'immutable';

import {Editor, EditorState, CompositeDecorator, ContentState, SelectionState,
  ContentBlock, CharacterMetadata, 
  convertFromRaw, convertToRaw, AtomicBlockUtils, RichUtils, Modifier } from 'draft-js';
import { CommandProcessor, Command } from '../command';

import { wrappers } from './wrappers/wrappers';
import { ContentWrapper } from './wrappers/common';
import { determineChangeType, SelectionChangeType, 
  getCursorPosition, hasSelection, getPosition } from './utils';
import { BlockProps } from './renderers/properties';
import { AuthoringActions } from '../../../../actions/authoring';
import { AppServices } from '../../../common/AppServices';
import { AppContext } from '../../../common/AppContext';
import * as common from '../../../../data/content/html/common';
import { Html } from '../../../../data/contentTypes';
import { getRendererByName, BlockRenderer } from './renderers/registry';
import { buildCompositeDecorator } from './decorators/composite';
import { getAllEntities, EntityInfo, EntityRange } from '../../../../data/content/html/changes';
import handleBackspace from './keyhandlers/backspace';
import { insertBlocksAfter, containerPrecondition } from './commands/common';
import { wouldViolateSchema, validateSchema } from './paste';
import guid from '../../../../utils/guid';
export type ChangePreviewer = (current: Html, next: Html) => Html;


const SHIFT_KEY = 16;
const ENTER_KEY = 13; 
const ALT_KEY = 18; 
const PADDING = 0;

interface DraftWrapper {
  lastBlockY: number;
  onChange: any;
  focus: () => any; 
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
  undoRedoGuid: string;
  locked: boolean;
  context: AppContext;
  services: AppServices;
  inlineToolbar: any;
  blockToolbar: any;
  inlineInsertionToolbar: any;
  activeItemId: string;
  inlineOnlyMode: boolean;
  editorStyles?: Object;
  changePreviewer?: ChangePreviewer;
}



interface DraftWrapperState {
  editorState: EditorState;
  lockedByBlockRenderer: boolean;
  show: boolean;
  component: any;
  blockToolbarShown: boolean;
  blockY: number; 
  blockX: number;
  x: number;
  y: number;
  alignLeft: boolean;
}

const styles = {
  editor: {
    border: 'none',
    cursor: 'text',
    minHeight: 300,
  },
};

const styleMap = {
  SUBSCRIPT: {
    lineHeight: '0',
    position: 'relative',
    verticalAlign: 'baseline',
    fontSize: '75%',
    bottom: '-0.25em',
  },
  SUPERSCRIPT: {
    lineHeight: '0',
    position: 'relative',
    verticalAlign: 'baseline',
    fontSize: '75%',
    top: '-0.5em',
  },
  CITE: {
    fontStyle: 'italic',
    textDecoration: 'underline',
  },
  TERM: {
    textDecoration: 'underline',
  },
  QUOTE: {
    fontStyle: 'italic',
  },
  IPA: {
    // TODO
  },
  FOREIGN: {
    fontStyle: 'italic',
  },
  STRIKETHROUGH: {
    textDecoration: 'line-through',
  },
  HIGHLIGHT: {
    backgroundColor: '#FFFF00',
  },
  OBLIQUE: {
    fontStyle: 'oblique',
  },
  DEEMPHASIS: {
    fontWeight: 'lighter',
  },
  SYM: {
    // TODO
  },
};

const UL_WRAP = <ul className="public-DraftStyleDefault-ul" />;
const OL_WRAP = <ol className="public-DraftStyleDefault-ol" />;

const blockRenderMap = Immutable.Map({
  'header-one': { element: 'h1' },
  'header-two': { element: 'h2' },
  'header-three': { element: 'h3' },
  'header-four': { element: 'h4' },
  'header-five': { element: 'h5' },
  'header-six': { element: 'h6' },
  blockquote: { element: 'blockquote' },
  code: { element: 'pre' },
  atomic: { element: 'div' },
  'unordered-list-item': { element: 'li', wrapper: UL_WRAP },
  'ordered-list-item': { element: 'li', wrapper: OL_WRAP },
  unstyled: { element: 'div' },
  formula: { element: 'div' },
});

// tslint:disable-next-line
const BlockRendererFactory = (props) => {

  const entity = props.contentState.getEntity(
    props.block.getEntityAt(0),
  );

  const data = entity.getData();
  const type = entity.getType();

  const viewer = getRendererByName(type).viewer;

  const childProps = Object.assign({}, props, { data });

  return React.createElement((viewer as any), childProps);
};


function splitBlockInContentState(
  contentState: ContentState,
  selectionState: SelectionState,
): ContentState {
  
  const key = selectionState.getAnchorKey();
  const offset = selectionState.getAnchorOffset();
  const blockMap = contentState.getBlockMap();
  const blockToSplit = blockMap.get(key);

  const text = blockToSplit.getText();
  const chars = blockToSplit.getCharacterList();

  const blockAbove = blockToSplit.merge({
    text: text.slice(0, offset),
    characterList: chars.slice(0, offset),
  });

  const dataAbove = blockAbove.data.toJSON();
  
  const toPreserve = Object.keys(dataAbove)
    .filter(key => key.startsWith('oli') || key === 'semanticContext')
    .reduce(
      (o, key) => {
        o[key] = dataAbove[key];
        return o;
      }, 
      {});
  
  const keyBelow = common.generateRandomKey();
  const blockBelow = blockAbove.merge({
    key: keyBelow,
    text: text.slice(offset),
    characterList: chars.slice(offset),
    data: Immutable.Map(toPreserve),
  });

  const blocksBefore = blockMap.toSeq().takeUntil(v => v === blockToSplit);
  const blocksAfter = blockMap.toSeq().skipUntil(v => v === blockToSplit).rest();
  const newBlocks = blocksBefore.concat(
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

function appendText(contentBlock, contentState, text) {

  const targetRange = new SelectionState({
    anchorKey: contentBlock.key,
    focusKey: contentBlock.key,
    anchorOffset: contentBlock.text.length,
    focusOffset: contentBlock.text.length,
  });

  return Modifier.insertText(
    contentState,
    targetRange,
    text);
    
}

function updateData(contentBlock, contentState, blockData) {

  const targetRange = new SelectionState({
    anchorKey: contentBlock.key,
    focusKey: contentBlock.key,
    anchorOffset: 0,
    focusOffset: contentBlock.text.length,
  });

  return Modifier.setBlockData(
    contentState,
    targetRange,
    blockData);
    
}

function addSpaceAfterEntity(editorState, block) {
    
  const blockKey = block.key;
  const characterList = block.characterList;
  if (block.type !== 'atomic' && (!characterList.isEmpty() && characterList.last().getEntity())) {
    const modifiedContent = appendText(block, editorState.getCurrentContent(), ' ');
    return EditorState.push(editorState, modifiedContent, editorState.getLastChangeType());
    
  } else {
    return editorState;
  }
}

type StateAndSeen = { editorState: EditorState, seenIds: Object };

function deDupeIds(stateAndSeen: StateAndSeen, block) {
    
  const { editorState, seenIds } = stateAndSeen;

  const blockKey = block.key;
  const characterList = block.characterList;

  const id = block.data === undefined || block.data === null
    ? undefined
    : block.data.get('id');

  if (id !== undefined && seenIds[id]) {
    // Dedupe
    const blockData = Immutable.Map<string, string>()
      .set('id', guid())
      .set('title', '')
      .set('type', '');

    const modifiedContent = updateData(block, editorState.getCurrentContent(), blockData);
    return { 
      editorState: EditorState.push(
        editorState, modifiedContent, editorState.getLastChangeType()),
      seenIds,
    };
    
  } else if (id !== undefined) {
    seenIds[id] = true;
    return { editorState, seenIds };
  } else {
    return stateAndSeen;
  }
}



class DraftWrapper extends React.Component<DraftWrapperProps, DraftWrapperState>
  implements CommandProcessor<EditorState> {

  constructor(props) {
    super(props);

    this.lastBlockY = 0;
    this.focus = () => (this.refs as any).editor.focus();
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
    this.lastSelectionState = null;

    this._dismissToolbar = this.dismissToolbar.bind(this);
    this.mouseDown = false;
    this.shiftPressed = false;

    this._onKeyDown = this.onKeyDown.bind(this);
    this._onKeyUp = this.onKeyUp.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onClickExpand = this.onClickExpand.bind(this);

    const contentState = props.content.contentState;
    this.lastContent = contentState;
    
    const es = EditorState.createWithContent(contentState, this.getCompositeDecorator());
    const newEditorState = EditorState.set(es, { allowUndo: false });

    this.state = {
      editorState: newEditorState,
      lockedByBlockRenderer: false,
      show: false,
      x: null,
      y: null,
      blockToolbarShown: false,
      blockY: null,
      blockX: null,
      component: null,
      alignLeft: true,
    };
    
    this.onChange = (currentEditorState : EditorState) => {
    
      // You wouldn't think that this check would be necessary, but I was seeing
      // change notifications fired from Draft even when it was not in edit mode.
      if (!this.props.locked) {
        
        let editorState = currentEditorState;

        const ss = editorState.getSelection();
        const changeType : SelectionChangeType = determineChangeType(this.lastSelectionState, ss);
        this.lastSelectionState = ss; 
        this.handleSelectionChange(changeType, ss);

        let contentState = editorState.getCurrentContent();
        const contentChange = contentState !== this.lastContent;
        
        if (contentChange) {
          
          contentState = this.cloneDuplicatedEntities(contentState);

          editorState = EditorState.push(editorState, contentState);

          const blocks = contentState.blockMap;
          editorState = blocks.reduce(addSpaceAfterEntity, editorState);
          contentState = editorState.getCurrentContent();

          const seenIds = {};
          const result = contentState.blockMap.reduce(deDupeIds, { editorState, seenIds });
          editorState = result.editorState;
          contentState = editorState.getCurrentContent();

          this.lastContent = contentState;
          this.setState({ editorState }, () => this.props.onEdit(new Html({ contentState })));
        } else {
          this.setState({ editorState });
        }
        
        
      }
    };
  }

  forceContentChangeWithSelection(contentState, changeType, selection) {
    this.lastContent = contentState;
    
    const es = EditorState.push(this.state.editorState, contentState, changeType);
    const editorState = EditorState.forceSelection(
      EditorState.set(es, { allowUndo: false }), selection);

    this.setState({ editorState }, () => {

      this.props.onEdit(new Html({ contentState }));
      this.forceRender();
    });
  }

  forceContentChange(contentState, changeType) {
    this.lastContent = contentState;
    
    const editorState = EditorState.push(this.state.editorState, contentState, changeType);
    this.setState({ editorState }, () => {
      this.props.onEdit(new Html({ contentState }));
      this.forceRender();
    });
  }

  

  onBlur(e) {
    e.stopPropagation();
    if (this.state.show || this.state.blockToolbarShown) {
      setTimeout(
        () => this.setState({ 
          blockToolbarShown: false, 
          show: false, x: null, y: null }), 
        200);
    }
  }

  setExpanderPosition() {
    let topRect = getPosition();

    if (topRect === null) {
      const position = getCursorPosition();
      if (position !== null) {
        topRect = {
          top: position.y,
          left: position.x,
          bottom: 0,
          right: 0,
          height: 0,
          width: 0,
        };
      }
    }

    if (topRect !== null) {
      const divRect = this.container.getBoundingClientRect();

      let blockY = topRect.top + window.scrollY - (divRect.top + window.scrollY);
      const blockX = -27;
      
      if (blockY < 0) {
        blockY = this.lastBlockY;
      }

      this.setState({ blockY, blockX });
      this.lastBlockY = blockY;
    }
          
  }

  onFocus() {
    this.setExpanderPosition();
  }


  handleSelectionChange(changeType, ss) {

    if (changeType === SelectionChangeType.Selection) {  

      if (hasSelection(ss)) {
        const selection = document.getSelection();
        if (selection.rangeCount !== 0) {
          let topRect = getPosition();

          if (topRect === null) {
            const position = getCursorPosition();
            if (position !== null) {
              topRect = {
                top: position.y,
                left: position.x,
                bottom: 0,
                right: 0,
                height: 0,
                width: 0,
              };
            }
          }

          if (topRect === null) {
            this.setState({ show: false, x: null, y: null, blockX: null, blockY: null });
            return;
          }
          
          const divRect = this.container.getBoundingClientRect();
          const y = (topRect.top + window.scrollY - (divRect.top + window.scrollY)) - 25;
      
          const alignLeft = topRect.left - divRect.left < divRect.width / 2;

          const x = alignLeft
            ? topRect.left - divRect.left
            : (divRect.width - (topRect.left - divRect.left));
          
          if (topRect !== null) {
            const show = !this.shiftPressed;

            this.setState({ show, x, y, 
              component: this.props.inlineToolbar, alignLeft, blockX: null, blockY: null });
            
          } else {
            this.setState({ show: false, x: null, y: null, blockX: null, blockY: null });
          }
        }
      } else {   
        this.setState({ show: false, x: null, y: null, blockX: null, blockY: null });
      }
      
      this.setExpanderPosition();
      
    } else if (changeType === SelectionChangeType.CursorPosition) {
      this.setState({ show: false, x: null, y: null, blockX: null, blockY: null });
      this.setExpanderPosition();
    } else {
      // this.setState({ blockToolbarShown: false, blockX: null, blockY: null });
    }
  }
  

  dismissToolbar() {
    this.setState({ show: false, blockToolbarShown: false, x: null, 
      y: null, blockX: null, blockY: null });
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
        component: this.props.blockToolbar,
      });        
    }
  }

  onKeyUp(e) {
    
    if (e.keyCode === SHIFT_KEY) {
      this.shiftPressed = false;

      if (this.state.x !== null) {
        this.setState({ show: true });
      }

    } else if (e.keyCode === ALT_KEY) {
      this.setState({ show: false, x: null, y: null });
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

  removeBlock(block) {

    const contentState = this.state.editorState.getCurrentContent();
    const blockMap = contentState.getBlockMap();
    const toRemove = blockMap.get(block.key);
  
    const blocksBefore = blockMap.toSeq().takeUntil(v => v === toRemove);
    const blocksAfter = blockMap.toSeq().skipUntil(v => v === toRemove).rest();
    const newBlocks = blocksBefore.concat(blocksAfter).toOrderedMap();
  
    const updated = contentState.merge({ blockMap: newBlocks });

    this.forceContentChange(updated, 'remove-range');

    // Workaround to 'unfreeze' the editor
    setTimeout(
      () => {
        this.setState(
          { lockedByBlockRenderer: true }, 
          () => this.setState({ lockedByBlockRenderer: false }));
      }, 
      100);
  }

  insertEmptyBlockAfter(key) {

    const emptyCharList = Immutable.List().push(new CharacterMetadata());
  
    const blocks = [
      new ContentBlock({ 
        type: 'unstyled',  
        text: ' ', 
        key: common.generateRandomKey(),
        characterList: emptyCharList,
      }),
    ];

    const contentState = insertBlocksAfter(
      this.state.editorState.getCurrentContent(),
      key, blocks);

    const newKey = blocks[0].key;

    const selection = new SelectionState({
      anchorKey: newKey,
      focusKey: newKey,
      anchorOffset: 0,
      focusOffset: 0,
    });

    this.forceContentChangeWithSelection(
      contentState, 'insert-fragment', selection);
  }

  getSingularKey(o) {
    if (Object.keys(o).length === 1) {
      return Object.keys(o)[0];
    } else {
      return null;
    }
  }

  cloneDuplicatedEntities(current: ContentState) : ContentState {
    
    let contentState = current;
    const entities = getAllEntities(contentState);
    
    // Find any duplicated entities and clone them
    const seenKeys = {};
    entities.forEach((e) => {
      if (seenKeys[e.entityKey] === undefined) {
        seenKeys[e.entityKey] = e;
      } else {
        // This is a duplicate, clone it
        
        const copy = Object.assign({}, e.entity.data);

        // If the data has an id, generate a new one to 
        // avoid duplication 
        if (copy.id !== undefined) {
          copy.id = guid();
        } else {
          const key = this.getSingularKey(copy);
          if (key !== null && copy[key].id !== undefined) {
            copy[key] = copy[key].with({ id: guid() });
          }
        }

        contentState = contentState.createEntity(
          e.entity.type, e.entity.mutability, copy);
        const createdKey = contentState.getLastCreatedEntityKey();
        const range = new SelectionState({
          anchorKey: e.range.contentBlock.key,
          focusKey: e.range.contentBlock.key,
          anchorOffset: e.range.start,
          focusOffset: e.range.end,
        });
        contentState = Modifier.applyEntity(contentState, range, createdKey);
      }
    });

    return contentState;
  }

  blockRenderer(block) {
    if (block.getType() === 'atomic') {
      return {
        component: BlockRendererFactory,
        editable: false,
        props: {
          onContentChange: (contentState: ContentState) => {
            this.forceContentChange(contentState, 'apply-entity');
          },
          onLockChange: (locked) => {
            this.setState({ lockedByBlockRenderer: locked });
          },
          onEditModeChange: (editMode) => {
            // this.props.onEditModeChange(block.getKey(), editMode);
          },
          onEdit: (data) => {
            this.processBlockEdit(block, data);
          },
          onInsertBlock: (key) => {
            this.insertEmptyBlockAfter(key);
          },
          onRemove: () => {
            this.removeBlock(block);
          },
          editMode: !this.props.locked,
          services: this.props.services,
          context: this.props.context,
        },
      };
    }

    return null;
  }

  handleKeyCommand(command) {

    const editorState = this.state.editorState;
    
    if (command === 'backspace') {
      if (handleBackspace(editorState, this.onChange) === 'handled') {
        return 'handled';
      }

      // Do not allow users to press enter and create a new block when
      // their cursor is within titles, pronunciations, or translations
    } else if (command === 'split-block' && 
        !containerPrecondition(
          editorState.getSelection(), editorState.getCurrentContent(),
          [common.EntityTypes.title_begin, 
            common.EntityTypes.pronunciation_begin, 
            common.EntityTypes.translation_begin],
          [common.EntityTypes.title_end, 
            common.EntityTypes.pronunciation_end, 
            common.EntityTypes.translation_end])) {

      return 'handled';
    
    // In 'inlineOnlyMode' we do not allow the user to create additional
    // blocks
    } else if (command === 'split-block' && this.props.inlineOnlyMode) {
      return 'handled';
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

      if (nextProps.content.contentState !== current 
        && nextProps.undoRedoGuid !== this.props.undoRedoGuid) {
        
        const selection = nextProps.content.contentState.getSelectionBefore();
        this.lastContent = nextProps.content.contentState;
        const newEditorState = EditorState.push(
          this.state.editorState, nextProps.content.contentState);
        
        this.setState({
          editorState: newEditorState,
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
    
    for (let i = 0; i < components.length; i += 1) {
      
      const comp = components[i];
      const block = content.getBlockForKey(comp.key);

      // Block will be undefined when what we have encountered is a Draft
      // block level wrapper such as a ol or a ul that is wrapping a series
      // of li blocks.  
      if (block === undefined) {
        if (currentWrapper === null) {
          updated.push(comp);
        } else {
          current.push(comp);
        }
        
        continue;
      }

      if (currentWrapper === null) {

        const foundWrapperBegin = wrappers.find(w => w.isBeginBlock(block, content));
        if (foundWrapperBegin !== undefined) {
          
          currentWrapper = foundWrapperBegin;

          children = [];
          // tslint:disable-next-line
          current = children;
          children.push(components[i]);

        } else {
          current.push(components[i]);
        }

      } else if (currentWrapper.isEndBlock(block, content)) {

        children.push(components[i]);
        updated.push(
          React.createElement(
            currentWrapper.component, 
            { key: 'block-' + block.key }, children));
        // tslint:disable-next-line
        current = updated;
        currentWrapper = null;

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

  checkPrecondition(command: Command<EditorState>) {
    return command.precondition(this.state.editorState, this.props.context);
  }

  getCompositeDecorator() {
    const onDecoratorEdit = (contentState: ContentState) => {
      this.forceContentChange(contentState, 'apply-entity');
    };
    const compositeDecorator = buildCompositeDecorator({ 
      activeItemId: this.props.activeItemId, services: this.props.services, 
      context: this.props.context, onEdit: onDecoratorEdit, 
    });
    return compositeDecorator;
  }

  forceRender() {

    const editorState = this.state.editorState;
    const content = editorState.getCurrentContent();
    
    const es = EditorState.createWithContent(content, this.getCompositeDecorator());
    const newEditorState = EditorState.set(es, { allowUndo: false });
    this.setState({ editorState: newEditorState });
  }

  renderToolbar() {
    
    if (this.state.show) {
      
      const additionalProps = {
        editorState: this.state.editorState,
        commandProcessor: this, 
        dismissToolbar: this._dismissToolbar,
      };
      const clonedToolbar = React.cloneElement(this.state.component, additionalProps);
      
      const positionStyle = {
        position: 'absolute',
        top: this.state.y,
      };

      this.state.alignLeft
        ? (positionStyle as any).left = this.state.x
        : (positionStyle as any).right = this.state.x;

      return <div style={positionStyle as any}>
          {clonedToolbar}
        </div>;
      
    } else {
      return null;
    }

  }

  isAtEmptyBlock() : boolean {
    const ss = this.state.editorState.getSelection();

    if (ss.getAnchorKey() === ss.getFocusKey()) {
      if (ss.getAnchorOffset() === 0 && ss.getFocusOffset() === 0) {

        const block = this.state.editorState.getCurrentContent().getBlockForKey(ss.getAnchorKey());
        return block.type === 'unstyled' && block.text === '';
      }
    }

    return false;
  }

  renderBlockToolbar() {
    
    if (this.state.blockToolbarShown) {
      
      const additionalProps = {
        editorState: this.state.editorState,
        commandProcessor: this, 
        dismissToolbar: this._dismissToolbar,
      };


      const component = this.isAtEmptyBlock()
        ? this.props.blockToolbar
        : this.props.inlineInsertionToolbar;

      const clonedToolbar = React.cloneElement(component, additionalProps);
      
      const positionStyle = {
        top: this.state.blockY,
        position: 'absolute',
        left: this.state.blockX + 75,
      };

      return <div style={positionStyle as any}>
          {clonedToolbar}
        </div>;
      
    } else {
      return null;
    }

  }

  blockStyleFn(contentBlock: ContentBlock) {
    const type = contentBlock.getType();
    if (type === 'formula') {
      return 'formulaDiv';
    } else if (type === 'code') {
      return 'codeDiv';
    }
  }

  handlePastedText(text, html) {
    // Disable pasting in inline mode
    if (this.props.inlineOnlyMode) {
      return true;
    }
  }


  // Do not allow pasting of fragments that would introduce
  // unbalanced block sentinels or that would violate content
  // model schema.
  handlePastedFragment(fragment, editorState) {
    if (this.props.inlineOnlyMode || wouldViolateSchema(fragment, editorState)) {
      return true;
    } 
  }

  // Prevent cut operations that would leave the document in
  // an invalid state.
  handleCutFragment(fragment, editorState, previewEditorState) {
    if (!validateSchema(previewEditorState.getCurrentContent())) {
      return true;
    } 
  }

  onClickExpand() {
    this.setState({ blockToolbarShown: !this.state.blockToolbarShown });
  }

  shouldShowExpander() {

    if (this.isAtEmptyBlock()) {
      if (!this.props.inlineOnlyMode && containerPrecondition(
        this.state.editorState.getSelection(), this.state.editorState.getCurrentContent(),
        [common.EntityTypes.title_begin, 
          common.EntityTypes.pronunciation_begin, 
          common.EntityTypes.translation_begin],
        [common.EntityTypes.title_end, 
          common.EntityTypes.pronunciation_end, 
          common.EntityTypes.translation_end])) {

        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
 
  }

  renderExpander() {

    if (this.state.blockX === null || !this.shouldShowExpander()) {
      return null;
    } else {

      const iconClasses = this.state.blockToolbarShown
        ? 'icon icon-minus'
        : 'icon icon-plus';

      const style = {
        color: 'black',
      };
      const buttonStyle = {
        backgroundColor: 'white',
        top: this.state.blockY,
        position: 'absolute',
        left: this.state.blockX + 25,
      };

      return <button 
          onClick={this.onClickExpand}
          type="button" 
          className="btn" 
          style={buttonStyle as any}>
          <i style={style} className={iconClasses}></i>
        </button>;
    }
    
  }

  render() {

    const editorStyle = this.props.editorStyles !== undefined 
      ? this.props.editorStyles 
      : styles.editor;

    (editorStyle as any).paddingLeft = '50px';
    (editorStyle as any).position = 'relative';
    (editorStyle as any).top = '0px';
    (editorStyle as any).left = '0px';
    
    return (
        <div ref={(container => this.container = container)} 
          onBlur={this.onBlur}
          onFocus={this.onFocus}
          onKeyUp={this._onKeyUp}
          onKeyDown={this._onKeyDown}
          style={editorStyle} 
          onClick={this.focus}>

          {this.renderExpander()}

          {this.renderToolbar()}

          {this.renderBlockToolbar()}

          <Editor ref="editor"
            spellCheck={true}
            stripPastedStyles={false}
            handleCutFragment={this.handleCutFragment.bind(this)}
            handlePastedText={this.handlePastedText.bind(this)}
            handlePastedFragment={this.handlePastedFragment.bind(this)}
            renderPostProcess={this.renderPostProcess.bind(this)}
            customStyleMap={styleMap}
            handleKeyCommand={this.handleKeyCommand}
            blockRenderMap={blockRenderMap}
            blockRendererFn={this.blockRenderer.bind(this)}
            blockStyleFn={this.blockStyleFn.bind(this)}
            editorState={this.state.editorState} 
            readOnly={this.state.lockedByBlockRenderer || this.props.locked}
            onChange={this.onChange} />

      </div>
    );
  }

}

export default DraftWrapper;
